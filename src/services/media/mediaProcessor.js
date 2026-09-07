/**
 * Media Processor Service
 * Processamento e conversão de áudio e vídeo com FFmpeg garantindo 100% de compatibilidade com WhatsApp Mobile e Web
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { MEDIA_ERRORS, MEDIA_LIMITS } = require('./constants')
const { toMessage, isMissingBinary } = require('./mediaErrors')
const logger = require('../../core/logger')

/**
 * Converte ou otimiza o arquivo de mídia para compatibilidade com o WhatsApp
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {object} options
 * @returns {Promise<string>}
 */
async function processMedia(inputPath, outputPath, { format = 'mp3', coverPath = null, timeoutMs = MEDIA_LIMITS.PROCESS_TIMEOUT_MS } = {}) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputPath)) {
            const err = new Error('Arquivo de entrada não existe para processamento.')
            err.code = MEDIA_ERRORS.MEDIA_NOT_FOUND
            return reject(err)
        }

        let args = ['-y', '-threads', '0', '-i', inputPath]

        if (format === 'mp3') {
            if (coverPath && fs.existsSync(coverPath)) {
                args.push(
                    '-i', coverPath,
                    '-map', '0:a',
                    '-map', '1:v',
                    '-c:a', 'libmp3lame',
                    '-b:a', '320k',
                    '-ar', '48000',
                    '-c:v', 'copy',
                    '-id3v2_version', '3',
                    '-metadata:s:v', 'title="Album cover"',
                    '-metadata:s:v', 'comment="Cover (front)"',
                    outputPath
                )
            } else {
                args.push(
                    '-vn',
                    '-acodec', 'libmp3lame',
                    '-b:a', '320k',
                    '-ar', '48000',
                    outputPath
                )
            }
        } else {
            // Formato de vídeo 100% compatível com WhatsApp Mobile (Android/iOS) e Web:
            // H.264 Main Profile + yuv420p + AAC stereo + faststart
            args.push(
                '-c:v', 'libx264',
                '-profile:v', 'main',
                '-level:v', '4.0',
                '-pix_fmt', 'yuv420p',
                '-preset', 'veryfast',
                '-crf', '24',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-ar', '44100',
                '-movflags', '+faststart',
                outputPath
            )
        }

        let proc
        try {
            proc = spawn('ffmpeg', args)
        } catch (spawnErr) {
            const err = new Error(`Falha ao iniciar o ffmpeg: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            return reject(err)
        }
        let stderrData = ''

        proc.on('error', spawnErr => {
            clearTimeout(timer)
            logger.error(`[FFMPEG ERROR] Falha ao iniciar ffmpeg: ${spawnErr.message}`)
            const err = new Error(isMissingBinary(spawnErr)
                ? 'ffmpeg não encontrado no ambiente (PATH do processo).'
                : `Falha ao iniciar ffmpeg: ${spawnErr.message}`)
            err.code = MEDIA_ERRORS.EXECUTABLE_NOT_FOUND
            reject(err)
        })

        proc.stderr.on('data', chunk => {
            stderrData += chunk.toString()
        })

        const timer = setTimeout(() => {
            try { proc.kill('SIGKILL') } catch (_) {}
            const err = new Error('Tempo limite de processamento com FFmpeg excedido.')
            err.code = MEDIA_ERRORS.TIMEOUT
            reject(err)
        }, timeoutMs)

        proc.on('close', code => {
            clearTimeout(timer)
            if (code !== 0 || !fs.existsSync(outputPath)) {
                logger.error(`[FFMPEG ERROR] Falha no processamento (código ${code}, signal=${proc.signalCode || 'null'}): ${stderrData || 'sem stderr'}`)
                const err = new Error(toMessage('Falha na conversão de mídia com FFmpeg.', stderrData))
                err.code = MEDIA_ERRORS.PROCESSING_FAILED
                return reject(err)
            }
            resolve(outputPath)
        })
    })
}

/**
 * Inspeciona os codecs de vídeo e áudio via ffprobe
 * @param {string} filePath
 * @returns {Promise<{vcodec: string|null, acodec: string|null}>}
 */
function probeVideoCodecs(filePath) {
    return new Promise(resolve => {
        const proc = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'stream=index,codec_type,codec_name',
            '-of', 'json',
            filePath
        ])
        let out = ''
        proc.stdout.on('data', d => { out += d })
        const t = setTimeout(() => { try { proc.kill() } catch (_) {} resolve(null) }, 6000)
        proc.on('close', code => {
            clearTimeout(t)
            if (code !== 0) return resolve(null)
            try {
                const data = JSON.parse(out)
                const streams = data.streams || []
                const v = streams.find(s => s.codec_type === 'video')
                const a = streams.find(s => s.codec_type === 'audio')
                resolve({
                    vcodec: v ? (v.codec_name || '').toLowerCase() : null,
                    acodec: a ? (a.codec_name || '').toLowerCase() : null
                })
            } catch (_) {
                resolve(null)
            }
        })
        proc.on('error', () => { clearTimeout(t); resolve(null) })
    })
}

/**
 * Inspeciona e otimiza um vídeo para garantir que o WhatsApp Mobile (Android/iOS)
 * consiga reproduzir sem travamento, tela preta ou loop infinito.
 * Só re-encode se o vídeo for codec incompatível (vp9, av1, hevc) ou container não-MP4.
 * @param {string} filePath
 * @returns {Promise<string>} Caminho do arquivo compatível
 */
async function ensureMobileVideoCompatibility(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return filePath
    const ext = path.extname(filePath).toLowerCase()
    const stats = fs.statSync(filePath)

    // Inspeciona codecs reais do arquivo
    const codecs = await probeVideoCodecs(filePath)
    const isH264 = codecs && (codecs.vcodec === 'h264' || codecs.vcodec === 'avc1')
    const isAacOrMp3 = codecs && (codecs.acodec === 'aac' || codecs.acodec === 'mp3')

    // Se já for MP4 com H.264 e áudio compatível, preserva 100% da integridade
    if (ext === '.mp4' && isH264 && isAacOrMp3) {
        return filePath
    }

    // Se o arquivo tiver mais de 200MB e não couber na galeria (vai como documento),
    // não perde tempo re-encodando; players externos rodam VP9/AV1
    if (stats.size > 200 * 1024 * 1024) {
        return filePath
    }

    // Converte para H.264 + AAC com alta velocidade e suporte a multi-threading (-threads 0)
    const outPath = path.join(path.dirname(filePath), `mobile_${Date.now()}_${path.basename(filePath, ext)}.mp4`)
    try {
        let args
        // Otimização de alta velocidade: se o vídeo já for H.264, copia o vídeo diretamente (~1s) e apenas converte o áudio para AAC
        if (isH264) {
            args = [
                '-y', '-threads', '0', '-i', filePath,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-ar', '44100',
                '-movflags', '+faststart',
                outPath
            ]
        } else {
            args = [
                '-y', '-threads', '0', '-i', filePath,
                '-c:v', 'libx264',
                '-profile:v', 'high',
                '-pix_fmt', 'yuv420p',
                '-preset', 'veryfast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-ar', '44100',
                '-movflags', '+faststart',
                outPath
            ]
        }
        const proc = spawn('ffmpeg', args)
        await new Promise((resolve, reject) => {
            // Timeout de 10 minutos (600s) para re-encode seguro
            const timer = setTimeout(() => { try { proc.kill('SIGKILL') } catch (_) {} reject(new Error('timeout')) }, 600000)
            proc.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)) })
            proc.on('error', reject)
        })
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
            try { fs.unlinkSync(filePath) } catch (_) {}
            logger.info(`[MOBILE VIDEO] Transcodificado com sucesso para H.264 Mobile: ${outPath}`)
            return outPath
        }
    } catch (err) {
        logger.warn(`[MOBILE VIDEO] Re-encode falhou ou não necessário: ${err.message} — mantendo arquivo original.`)
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath) } catch (_) {}
    }
    return filePath
}

module.exports = {
    processMedia,
    ensureMobileVideoCompatibility
}
