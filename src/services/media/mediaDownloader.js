/**
 * MeliodasBot — Media Downloader Service
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
    const jobTempDir = path.join(tempDir, 'media', jobId)

    if (!fs.existsSync(jobTempDir)) {
        fs.mkdirSync(jobTempDir, { recursive: true })
    }

    job.tempDir = jobTempDir
    const formatConfig = resolveDownloadFormat({
        format: job.requestedFormat || FORMATS.MP4,
        quality: job.requestedQuality || (
            (job.requestedFormat === FORMATS.MP3 || job.requestedFormat === 'mp3') ? undefined : '1080p'
        )
    })

    const outputTemplate = path.join(jobTempDir, `media_${jobId}.%(ext)s`)

    const args = buildYtDlpArgs([
        '--no-playlist',
        '--no-warnings',
        '-o', outputTemplate,
        ...formatConfig.args,
        job.source
    ])

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

        activeProcesses.set(jobId, proc)

        // Erro de spawn pós-criação (ex: binário ausente -> ENOENT)
        proc.on('error', async spawnErr => {
            if (activeProcesses.has(jobId)) {
                activeProcesses.delete(jobId)
                clearTimeout(timer)
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

        proc.stdout.on('data', chunk => {
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
            stderrData += chunk.toString()
        })

        // Timeout DINÂMICO por duração: um vídeo longo (permitido até 60 min) não
        // pode ser morto pelo timeout base de 3 min. Damos ~1.2s de janela por
        // segundo de vídeo, com piso no timeout base e teto configurável.
        const durationSec = Number(job.duration) || 0
        const dynamicTimeout = Math.min(
            MEDIA_LIMITS.MAX_DOWNLOAD_TIMEOUT_MS,
            Math.max(MEDIA_LIMITS.DOWNLOAD_TIMEOUT_MS, Math.round(durationSec * 1200))
        )
        const timer = setTimeout(() => {
            if (activeProcesses.has(jobId)) {
                proc.kill('SIGKILL')
                activeProcesses.delete(jobId)
                cleanupJobDir(jobTempDir)
                const mins = Math.round(dynamicTimeout / 60000)
                const err = new Error(`Tempo limite de download excedido (${mins} min).`)
                err.code = MEDIA_ERRORS.TIMEOUT
                reject(err)
            }
        }, dynamicTimeout)

        proc.on('close', async code => {
            clearTimeout(timer)
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

                // Validação de limite de tamanho (WhatsApp-safe)
                if (stats.size > MEDIA_LIMITS.MAX_FILE_SIZE_BYTES) {
                    cleanupJobDir(jobTempDir)
                    const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
                    const limitMb = (MEDIA_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)
                    const err = new Error(`Arquivo muito grande (${sizeMb} MB). O limite suportado é ${limitMb} MB.`)
                    err.code = MEDIA_ERRORS.FILE_TOO_LARGE
                    return reject(err)
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

