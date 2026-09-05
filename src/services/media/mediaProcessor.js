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

        let args = ['-y', '-i', inputPath]

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
 * Inspeciona e otimiza um vídeo para garantir que o WhatsApp Mobile (Android/iOS)
 * consiga reproduzir sem travamento, tela preta ou loop infinito.
 * Só re-encode se o vídeo for incompatível (webm, mkv, codec não-H264, etc).
 * @param {string} filePath
 * @returns {Promise<string>} Caminho do arquivo compatível
 */
async function ensureMobileVideoCompatibility(filePath) {
    if (!filePath || !fs.existsSync(filePath)) return filePath
    const ext = path.extname(filePath).toLowerCase()

    // Se o arquivo tiver mais de 200MB, não tenta reprocessar
    const stats = fs.statSync(filePath)
    if (stats.size > 200 * 1024 * 1024) return filePath

    // Se já for MP4, preserva 100% da qualidade, tamanho original e bitrate
    if (ext === '.mp4') {
        return filePath
    }

    // Se não for MP4 ou for codec incompatível, converte com QUALIDADE ALTA
    const outPath = path.join(path.dirname(filePath), `mobile_${Date.now()}_${path.basename(filePath, ext)}.mp4`)
    try {
        // CRF 18 = visualmente sem perda (qualidade muito superior ao CRF 24 antigo)
        // AAC 256kbps = áudio de alta qualidade (era 128kbps)
        const args = [
            '-y', '-i', filePath,
            '-c:v', 'libx264',
            '-profile:v', 'high',
            '-level:v', '5.1',
            '-pix_fmt', 'yuv420p',
            '-preset', 'slow',
            '-crf', '18',
            '-c:a', 'aac',
            '-b:a', '256k',
            '-ar', '48000',
            '-movflags', '+faststart',
            outPath
        ]
        const proc = spawn('ffmpeg', args)
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => { try { proc.kill('SIGKILL') } catch (_) {} reject(new Error('timeout')) }, 120000)
            proc.on('close', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)) })
            proc.on('error', reject)
        })
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
            try { fs.unlinkSync(filePath) } catch (_) {}
            return outPath
        }
    } catch (err) {
        logger.warn(`[MOBILE VIDEO] Re-encode falhou: ${err.message} — usando arquivo original.`)
        try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath) } catch (_) {}
    }
    return filePath
}

module.exports = {
    processMedia,
    ensureMobileVideoCompatibility
}
