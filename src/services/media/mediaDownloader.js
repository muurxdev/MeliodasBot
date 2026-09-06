/**
 * Media Downloader Service
 * Execução segura de download com diretório isolado por Job, timeouts e cancelamento ativo
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { tempDir } = require('../../config/paths')
const { resolveDownloadFormat } = require('./formatResolver')
const { MEDIA_ERRORS, MEDIA_LIMITS, FORMATS } = require('./constants')
const { buildYtDlpArgs, getYtDlpEnv } = require('./mediaArgs')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const drive = require('../drive/googleDriveService')
const logger = require('../../core/logger')

const activeProcesses = new Map()

/**
 * Baixa uma mídia de forma isolada e segura
 * @param {object} job - Objeto de Job do Media Engine
 * @param {Function} [onProgress] - Callback de progresso
 * @returns {Promise<object>}
 */
async function downloadMedia(job, onProgress = null) {
    const startedAt = Date.now()   // para medir o tempo REAL de download
    const jobId = job.id || `job_${Date.now()}`

    // 1. Verificação instantânea de Cache em Disco (<50ms)
    const mediaCache = require('./mediaCacheService')
    const cached = mediaCache.get(job.source, job.requestedFormat, job.requestedQuality)
    if (cached && fs.existsSync(cached.filePath)) {
        logger.info(`[MEDIA CACHE HIT] Arquivo servido do cache em ${Date.now() - startedAt}ms: ${cached.filePath}`)
        return {
            success: true,
            jobId,
            filePath: cached.filePath,
            fileName: path.basename(cached.filePath),
            files: [cached.filePath],
            primaryFile: cached.filePath,
            isGallery: false,
            format: job.requestedFormat,
            mimeType: cached.meta?.mimeType || (job.requestedFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4'),
            size: cached.size,
            stats: fs.statSync(cached.filePath),
            elapsedMs: Date.now() - startedAt,
            fromCache: true
        }
    }

    const jobTempDir = path.join(tempDir, 'media', jobId)

    if (!fs.existsSync(jobTempDir)) {
        fs.mkdirSync(jobTempDir, { recursive: true })
    }

    job.tempDir = jobTempDir
    const reqFormat = job.requestedFormat || job.format || FORMATS.MP4
    const reqQuality = job.requestedQuality || job.quality || 'best'

    const formatConfig = resolveDownloadFormat({
        format: reqFormat,
        // Sem teto: maior resolução disponível (best). Pode ser 1440p/4K quando existir.
        quality: reqQuality
    })

    const isYouTube = /youtu(\.be|be\.com)/i.test(job.source)
    const { isYtDlpAvailable } = require('./mediaEnvCheck')

    // Se o yt-dlp não estiver no ambiente e o link for do YouTube, vai direto para a engine resiliente
    if (isYouTube && !isYtDlpAvailable()) {
        try {
            const { downloadYouTubeResilient } = require('./youtubeFallback')
            const ext = (reqFormat === FORMATS.MP3 || reqFormat === 'mp3') ? 'mp3' : 'mp4'
            const fallbackDest = path.join(jobTempDir, `media_${jobId}.${ext}`)
            const ok = await downloadYouTubeResilient(job.source, fallbackDest, ext)
            if (ok && fs.existsSync(fallbackDest) && fs.statSync(fallbackDest).size > 0) {
                const stats = fs.statSync(fallbackDest)
                const mimeType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'
                mediaCache.set(job.source, job.requestedFormat, job.requestedQuality, fallbackDest, { mimeType, ext })
                logger.info(`[MEDIA DOWNLOAD] Download direto via engine resiliente (sem yt-dlp): ${fallbackDest}`)
                return {
                    success: true,
                    jobId,
                    filePath: fallbackDest,
                    fileName: path.basename(fallbackDest),
                    files: [fallbackDest],
                    primaryFile: fallbackDest,
                    isGallery: false,
                    format: job.requestedFormat,
                    mimeType,
                    size: stats.size,
                    stats,
                    elapsedMs: Date.now() - startedAt
                }
            }
        } catch (ytErr) {
            logger.warn(`[MEDIA DOWNLOAD] Engine resiliente falhou na inicialização: ${ytErr.message}`)
        }
    }

    const outputTemplate = path.join(jobTempDir, `media_${jobId}.%(ext)s`)

    const args = buildYtDlpArgs([
        '--no-playlist',
        '--no-warnings',
        '-o', outputTemplate,
        ...formatConfig.args,
        job.source
    ], { userJid: job.user })

    return new Promise((resolve, reject) => {
        let proc
        try {
            proc = spawn('yt-dlp', args, { env: getYtDlpEnv() })
        } catch (spawnErr) {
            cleanupJobDir(jobTempDir)
            const err = new Error(`Falha ao iniciar o yt-dlp: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return reject(err)
        }

        let watchdogInterval = null
        activeProcesses.set(jobId, proc)

        // Erro de spawn pós-criação (ex: binário ausente -> ENOENT)
        proc.on('error', async spawnErr => {
            if (activeProcesses.has(jobId)) {
                activeProcesses.delete(jobId)
                if (watchdogInterval) clearInterval(watchdogInterval)
                logger.error(`[MEDIA DOWNLOAD] Falha ao iniciar yt-dlp: ${spawnErr.message}`)

                const isYouTube = /youtu(\.be|be\.com)/i.test(job.source)
                if (isYouTube) {
                    try {
                        const { downloadYouTubeResilient } = require('./youtubeFallback')
                        const ext = (job.requestedFormat === FORMATS.MP3 || job.requestedFormat === 'mp3') ? 'mp3' : 'mp4'
                        const fallbackDest = path.join(jobTempDir, `media_${jobId}.${ext}`)
                        // Garante que o diretório existe antes de escrever
                        if (!fs.existsSync(jobTempDir)) fs.mkdirSync(jobTempDir, { recursive: true })
                        const ok = await downloadYouTubeResilient(job.source, fallbackDest, ext)
                        if (ok && fs.existsSync(fallbackDest) && fs.statSync(fallbackDest).size > 0) {
                            const stats = fs.statSync(fallbackDest)
                            logger.info(`[MEDIA DOWNLOAD] Download YouTube via engine resiliente (spawn error): ${fallbackDest}`)
                            return resolve({
                                success: true,
                                jobId,
                                filePath: fallbackDest,
                                fileName: path.basename(fallbackDest),
                                files: [fallbackDest],
                                primaryFile: fallbackDest,
                                isGallery: false,
                                format: job.requestedFormat,
                                mimeType: ext === 'mp3' ? 'audio/mpeg' : 'video/mp4',
                                size: stats.size,
                                stats,
                                elapsedMs: Date.now() - startedAt
                            })
                        }
                    } catch (fbErr) {
                        logger.warn(`[MEDIA DOWNLOAD] Fallback YouTube falhou: ${fbErr.message}`)
                    }
                }

                cleanupJobDir(jobTempDir)
                const err = new Error(isMissingBinary(spawnErr)
                    ? 'yt-dlp não encontrado no ambiente (PATH do processo).'
                    : `Falha ao iniciar yt-dlp: ${spawnErr.message}`)
                err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
                reject(err)
            }
        })

        let stderrData = ''
        let lastActivity = Date.now()

        proc.stdout.on('data', chunk => {
            lastActivity = Date.now()
            const str = chunk.toString()
            if (onProgress) {
                const match = str.match(/\[download\]\s+([\d\.]+)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/)
                if (match) {
                    onProgress({
                        percent: parseFloat(match[1]),
                        size: match[2],
                        speed: match[3],
                        eta: match[4]
                    })
                }
            }
        })

        proc.stderr.on('data', chunk => {
            lastActivity = Date.now()
            stderrData += chunk.toString()
        })

        // Timeout DINÂMICO por duração: um vídeo longo não pode ser morto pelo timeout base.
        // Se a duração for conhecida, escala com a duração. Se for desconhecida e for vídeo,
        // concede o teto máximo (MAX_DOWNLOAD_TIMEOUT_MS) com proteção de inatividade.
        const durationSec = Number(job.duration) || 0
        const dynamicTimeout = durationSec > 0
            ? Math.min(
                MEDIA_LIMITS.MAX_DOWNLOAD_TIMEOUT_MS,
                Math.max(MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS, Math.round(durationSec * 1200))
            )
            : (job.requestedFormat === FORMATS.MP4 || job.requestedFormat === 'mp4'
                ? MEDIA_LIMITS.MAX_DOWNLOAD_TIMEOUT_MS
                : MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS)

        // Inatividade: 120s (2 min) sem nenhum byte nem progresso do processo
        const INACTIVITY_TIMEOUT_MS = 120000

        watchdogInterval = setInterval(() => {
            if (!activeProcesses.has(jobId)) {
                clearInterval(watchdogInterval)
                return
            }
            const timeSinceLastActivity = Date.now() - lastActivity
            const totalElapsed = Date.now() - startedAt

            // 1. Teto máximo de execução
            if (totalElapsed >= dynamicTimeout) {
                clearInterval(watchdogInterval)
                proc.kill('SIGKILL')
                activeProcesses.delete(jobId)
                cleanupJobDir(jobTempDir)
                const mins = Math.round(dynamicTimeout / 60000)
                const err = new Error(`Tempo limite de download excedido (${mins} min).`)
                err.code = MEDIA_ERRORS.TIMEOUT
                return reject(err)
            }

            // 2. Travamento real: se passou o piso base de 3 min E está 2 min sem nenhum byte
            if (totalElapsed > MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS && timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
                clearInterval(watchdogInterval)
                proc.kill('SIGKILL')
                activeProcesses.delete(jobId)
                cleanupJobDir(jobTempDir)
                const err = new Error('Download estagnado sem dados recebidos da plataforma.')
                err.code = MEDIA_ERRORS.TIMEOUT
                return reject(err)
            }
        }, 5000)

        proc.on('close', async code => {
            clearInterval(watchdogInterval)
            activeProcesses.delete(jobId)

            if (code !== 0) {
                // Tenta fallback resiliente para links do YouTube
                const isYouTube = /youtu(\.be|be\.com)/i.test(job.source)
                if (isYouTube) {
                    try {
                        const { downloadYouTubeResilient } = require('./youtubeFallback')
                        const ext = (job.requestedFormat === FORMATS.MP3 || job.requestedFormat === 'mp3') ? 'mp3' : 'mp4'
                        const fallbackDest = path.join(jobTempDir, `media_${jobId}.${ext}`)
                        if (!fs.existsSync(jobTempDir)) fs.mkdirSync(jobTempDir, { recursive: true })
                        const ok = await downloadYouTubeResilient(job.source, fallbackDest, ext)
                        if (ok && fs.existsSync(fallbackDest) && fs.statSync(fallbackDest).size > 0) {
                            const stats = fs.statSync(fallbackDest)
                            const mimeType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'
                            mediaCache.set(job.source, job.requestedFormat, job.requestedQuality, fallbackDest, { mimeType, ext })
                            logger.info(`[MEDIA DOWNLOAD] Download YouTube via engine resiliente: ${fallbackDest}`)
                            return resolve({
                                success: true,
                                jobId,
                                filePath: fallbackDest,
                                fileName: path.basename(fallbackDest),
                                files: [fallbackDest],
                                primaryFile: fallbackDest,
                                isGallery: false,
                                format: job.requestedFormat,
                                mimeType: ext === 'mp3' ? 'audio/mpeg' : 'video/mp4',
                                size: stats.size,
                                stats,
                                elapsedMs: Date.now() - startedAt
                            })
                        }
                    } catch (fbErr) {
                        logger.warn(`[MEDIA DOWNLOAD] Fallback YouTube falhou: ${fbErr.message}`)
                    }
                }

                cleanupJobDir(jobTempDir)
                logger.error(`[MEDIA DOWNLOAD] Falha no download (código ${code}): ${stderrData.slice(0, 120) || 'sem stderr'}`)
                const err = new Error(toMessage('Falha ao baixar mídia da plataforma.', stderrData))
                err.code = MEDIA_ERRORS.DOWNLOAD_FAILED
                return reject(err)
            }

            // Localiza os arquivos baixados no diretório do job
            try {
                const files = fs.readdirSync(jobTempDir)
                if (files.length === 0) {
                    cleanupJobDir(jobTempDir)
                    const err = new Error('Nenhum arquivo gerado pelo download.')
                    err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
                    return reject(err)
                }

                // Identifica se é galeria ou arquivo único
                const mediaFiles = files.filter(f => !f.endsWith('.part') && !f.endsWith('.ytdl') && !f.endsWith('.description'))
                if (mediaFiles.length === 0) {
                    cleanupJobDir(jobTempDir)
                    const err = new Error('Nenhum arquivo de mídia gerado pelo download.')
                    err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
                    return reject(err)
                }

                const primaryFile = mediaFiles[0]
                const fullPath = path.join(jobTempDir, primaryFile)
                const stats = fs.statSync(fullPath)

                // Verificação do arquivo: deve existir e ter conteúdo
                if (!stats || stats.size <= 0) {
                    cleanupJobDir(jobTempDir)
                    const err = new Error('Arquivo de mídia vazio ou inválido gerado pelo download.')
                    err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
                    return reject(err)
                }

                // Validação de limite de tamanho:
                // Se o Google Drive estiver configurado, aceita arquivos maiores que 2GB (até MAX_DRIVE_FILE_SIZE_BYTES)
                const driveAtivo = drive.isConfigured()
                const maxPermitido = driveAtivo ? (MEDIA_LIMITS.MAX_DRIVE_FILE_SIZE_BYTES || 50 * 1024 * 1024 * 1024) : MEDIA_LIMITS.MAX_FILE_SIZE_BYTES

                if (stats.size > maxPermitido) {
                    cleanupJobDir(jobTempDir)
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
                    const limitMb = (maxPermitido / (1024 * 1024)).toFixed(0)
                    const err = new Error(`Arquivo muito grande (${sizeMb} MB). O limite suportado ${driveAtivo ? 'no Drive' : 'pelo WhatsApp'} é ${limitMb} MB.`)
                    err.code = MEDIA_ERRORS.FILE_TOO_LARGE
                    return reject(err)
                }

                if (!driveAtivo && stats.size > MEDIA_LIMITS.MAX_FILE_SIZE_BYTES) {
                    cleanupJobDir(jobTempDir)
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
                    const limitMb = (MEDIA_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)
                    const err = new Error(`Arquivo muito grande (${sizeMb} MB). O WhatsApp aceita no máximo ${limitMb} MB. Configure o Google Drive no bot para arquivos maiores que 2GB.`)
                    err.code = MEDIA_ERRORS.FILE_TOO_LARGE
                    return reject(err)
                }

                try {
                    mediaCache.set(job.source, job.requestedFormat, job.requestedQuality, fullPath, {
                        mimeType: formatConfig.mimeType,
                        ext: formatConfig.targetExt
                    })
                } catch (cErr) {
                    logger.warn(`[MEDIA CACHE] Falha ao salvar no cache principal: ${cErr.message}`)
                }

                resolve({
                    success: true,
                    jobId,
                    filePath: fullPath,
                    fileName: primaryFile,
                    files: mediaFiles.map(f => path.join(jobTempDir, f)),
                    size: stats.size,
                    mimeType: formatConfig.mimeType,
                    format: formatConfig.targetExt,
                    isGallery: mediaFiles.length > 1,
                    elapsedMs: Date.now() - startedAt
                })
            } catch (readErr) {
                cleanupJobDir(jobTempDir)
                reject(readErr)
            }
        })
    })
}

/**
 * Cancela um download ativo pelo ID do job
 * @param {string} jobId
 * @returns {boolean}
 */
function cancelDownload(jobId) {
    const proc = activeProcesses.get(jobId)
    if (proc) {
        proc.kill('SIGTERM')
        activeProcesses.delete(jobId)
        logger.info(`[MEDIA DOWNLOAD] Job ${jobId} cancelado com sucesso.`)
        return true
    }
    return false
}

/**
 * Remove com segurança o diretório temporário do Job
 * @param {string} dirPath
 */
function cleanupJobDir(dirPath) {
    if (!dirPath || !dirPath.includes('media')) return
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true })
        }
    } catch (err) {
        logger.warn(`[MEDIA CLEANUP] Erro ao limpar ${dirPath}: ${err.message}`)
    }
}

module.exports = {
    downloadMedia,
    cancelDownload,
    cleanupJobDir
}

