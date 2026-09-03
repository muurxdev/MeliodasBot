/**
 * Media Hub Service
 * Processamento e conversão de áudio, vídeo, imagens e figurinhas com transparência total
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const sharp = require('sharp')
const crypto = require('crypto')
const https = require('https')
const { downloadContentFromMessage, downloadMediaMessage, getMediaKeys } = require('@whiskeysockets/baileys')
const { tempDir } = require('../config/paths')
const { addExif } = require('../utils/stickerUtils')
const logger = require('../core/logger')
const { getBotName } = require('../config/botConfig')

/**
 * Baixa e descriptografa mídia do WhatsApp diretamente via HTTPS (IPv4) caso a API de fetch falhe
 */
async function downloadEncryptedViaHttps(downloadUrl, mediaKey, type) {
    if (!downloadUrl || !mediaKey) {
        throw new Error('URL ou mediaKey ausentes para download HTTPS direto')
    }

    const { cipherKey, iv } = await getMediaKeys(mediaKey, type)

    const encBuffer = await new Promise((resolve, reject) => {
        try {
            const u = new URL(downloadUrl)
            const req = https.get(u, {
                headers: {
                    'Origin': 'https://web.whatsapp.com',
                    'User-Agent': 'WhatsApp/2.24.1.1',
                    'Accept': '*/*'
                },
                family: 4,
                timeout: 15000
            }, (res) => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`HTTP ${res.statusCode} ao baixar mídia do WhatsApp`))
                }
                const chunks = []
                res.on('data', chunk => chunks.push(chunk))
                res.on('end', () => resolve(Buffer.concat(chunks)))
            })
            req.on('error', reject)
            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Timeout ao conectar ao CDN do WhatsApp'))
            })
        } catch (urlErr) {
            reject(urlErr)
        }
    })

    if (!encBuffer || encBuffer.length <= 10) {
        throw new Error('Dados criptografados inválidos recebidos do CDN')
    }

    const cipherText = encBuffer.slice(0, encBuffer.length - 10)
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv)
    return Buffer.concat([decipher.update(cipherText), decipher.final()])
}

/**
 * Baixa mídia de forma ultra-resiliente (trata mensagens diretas, citadas, miniaturas e reupload)
 * @param {object} messageWrapper - Objeto contendo o payload da mensagem ({ message: { ... } } ou mediaMsg)
 * @param {string} mediaType - 'sticker' | 'image' | 'video' | 'audio'
 * @param {object} [client] - Instância do Baileys socket para reupload se necessário
 * @returns {Promise<Buffer>}
 */
async function downloadWhatsAppMedia(messageWrapper, mediaType = 'image', client = null) {
    if (!messageWrapper) {
        throw new Error('Nenhuma mensagem ou mídia fornecida para download')
    }

    // 1. Tenta usar downloadMediaMessage se messageWrapper for um objeto com chave message
    if (messageWrapper?.message) {
        try {
            const buffer = await downloadMediaMessage(
                messageWrapper,
                'buffer',
                {},
                client ? { logger, reuploadRequest: (msg) => client.updateMediaMessage(msg) } : undefined
            )
            if (buffer && buffer.length > 0) return buffer
        } catch (err) {
            logger.warn(`[DOWNLOAD MEDIA] downloadMediaMessage falhou (${err.message}), tentando downloadContentFromMessage...`)
        }
    }

    // 2. Extrai o nó de mídia direto
    let mediaNode = messageWrapper
    if (messageWrapper?.message) {
        const m = messageWrapper.message
        mediaNode = m.stickerMessage || m.imageMessage || m.videoMessage || m.audioMessage || m.documentMessage || m
    }

    // 3. Verifica se o nó possui directPath ou thumbnailDirectPath
    let downloadTarget = { ...mediaNode }
    let actualType = mediaType

    if (!downloadTarget.url && downloadTarget.thumbnailDirectPath) {
        downloadTarget = {
            directPath: downloadTarget.thumbnailDirectPath,
            mediaKey: downloadTarget.mediaKey
        }
        actualType = 'thumbnail-link'
    } else if (!downloadTarget.url && downloadTarget.directPath) {
        downloadTarget = {
            directPath: downloadTarget.directPath,
            mediaKey: downloadTarget.mediaKey
        }
    }

    try {
        const stream = await downloadContentFromMessage(downloadTarget, actualType)
        const bufferArray = []
        for await (const chunk of stream) {
            bufferArray.push(chunk)
        }
        const finalBuf = Buffer.concat(bufferArray)
        if (finalBuf.length > 0) return finalBuf
    } catch (streamErr) {
        logger.warn(`[DOWNLOAD MEDIA] downloadContentFromMessage falhou (${streamErr.message}), tentando HTTPS fallback com IPv4...`)

        // 4. FALLBACK ULTRA-RESILIENTE: Download HTTPS direto via IPv4 e decriptação AES
        const candidateUrls = []
        if (downloadTarget.url) candidateUrls.push(downloadTarget.url)
        if (downloadTarget.directPath) {
            candidateUrls.push(`https://mmg.whatsapp.net${downloadTarget.directPath}`)
            candidateUrls.push(`https://mms.whatsapp.net${downloadTarget.directPath}`)
        }
        if (downloadTarget.thumbnailDirectPath) {
            candidateUrls.push(`https://mmg.whatsapp.net${downloadTarget.thumbnailDirectPath}`)
        }

        const mKey = downloadTarget.mediaKey || mediaNode?.mediaKey
        if (mKey && candidateUrls.length > 0) {
            for (const candUrl of candidateUrls) {
                try {
                    const decryptedBuf = await downloadEncryptedViaHttps(candUrl, mKey, actualType === 'thumbnail-link' ? 'image' : actualType)
                    if (decryptedBuf && decryptedBuf.length > 0) {
                        logger.info(`[DOWNLOAD MEDIA] Mídia recuperada com sucesso via HTTPS fallback (${candUrl.slice(0, 40)}...)`)
                        return decryptedBuf
                    }
                } catch (fallbackErr) {
                    logger.warn(`[DOWNLOAD MEDIA] Falha na URL candidata (${candUrl.slice(0, 35)}...): ${fallbackErr.message}`)
                }
            }
        }

        throw streamErr
    }
    throw new Error('Buffer de mídia vazio recebido do WhatsApp')
}

/**
 * Converte um buffer de imagem ou vídeo curto em uma figurinha WebP sem bordas pretas
 * @param {Buffer} buffer - Buffer do arquivo de mídia
 * @param {boolean} isAnimated - Se a mídia é um vídeo/GIF animado
 * @param {string} packname - Nome do pacote de figurinhas
 * @param {string} author - Autor da figurinha
 * @returns {Promise<Buffer>} Buffer do WebP formatado com metadados
 */
async function criarFigurinha(buffer, isAnimated = false, packname, author) {
    if (!packname) packname = getBotName()
    if (!author) author = getBotName()
    const id = Date.now() + '_' + Math.random().toString(36).substring(2, 7)

    // 1. Figurinhas Estáticas: Usa Sharp para transparência alfa real e zero bordas pretas
    if (!isAnimated) {
        try {
            const webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({
                    quality: 80,
                    lossless: false,
                    alphaQuality: 100
                })
                .toBuffer()

            return await addExif(webpBuffer, packname, author)
        } catch (sharpErr) {
            logger.warn('[MEDIA SERVICE] Sharp falhou, tentando fallback com FFmpeg:', sharpErr.message)
        }
    }

    // 2. Figurinhas Animadas ou Fallback: FFmpeg com filtro RGBA transparente
    const extIn = isAnimated ? 'mp4' : 'jpg'
    const inputPath = path.join(tempDir, `media_in_${id}.${extIn}`)
    const outputPath = path.join(tempDir, `media_out_${id}.webp`)

    fs.writeFileSync(inputPath, buffer)

    return new Promise((resolve, reject) => {
        let ffmpegCmd = ''
        if (isAnimated) {
            // Conversão de vídeo/gif para sticker animado com padding transparente
            ffmpegCmd = `ffmpeg -y -i "${inputPath}" -t 8 -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15" -vcodec libwebp -lossless 0 -q:v 60 -preset picture -loop 0 -an -vsync 0 "${outputPath}"`
        } else {
            // Imagem estática com padding transparente forçado em RGBA
            ffmpegCmd = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -vcodec libwebp -lossless 0 -q:v 75 -preset picture -an -vsync 0 "${outputPath}"`
        }

        exec(ffmpegCmd, async (err) => {
            try {
                if (err) {
                    logger.error('[MEDIA SERVICE] Erro ao executar FFmpeg:', err)
                    return reject(new Error('Falha na conversão com FFmpeg'))
                }

                if (!fs.existsSync(outputPath)) {
                    return reject(new Error('Arquivo de saída WebP não encontrado'))
                }

                const rawWebp = fs.readFileSync(outputPath)
                const webpComExif = await addExif(rawWebp, packname, author)
                resolve(webpComExif)
            } catch (convErr) {
                reject(convErr)
            } finally {
                try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath) } catch (_) {}
                try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch (_) {}
            }
        })
    })
}

/**
 * Remove arquivos temporários antigos do diretório temp/
 * @param {number} maxAgeMs - Idade máxima em milissegundos (padrão: 30 minutos)
 */
function limparArquivosTemporarios(maxAgeMs = 30 * 60 * 1000) {
    if (!fs.existsSync(tempDir)) return
    const now = Date.now()

    const isStale = p => {
        try {
            return now - fs.statSync(p).mtimeMs > maxAgeMs
        } catch (_) {
            return true
        }
    }

    const removeStaleDir = dirPath => {
        if (!fs.existsSync(dirPath)) return 0
        let removed = 0
        for (const entry of fs.readdirSync(dirPath)) {
            const entryPath = path.join(dirPath, entry)
            try {
                const stats = fs.statSync(entryPath)
                if (stats.isDirectory()) {
                    if (entry === 'media' || isStale(entryPath)) {
                        fs.rmSync(entryPath, { recursive: true, force: true })
                        removed++
                    } else {
                        removed += removeStaleDir(entryPath)
                    }
                } else if (isStale(entryPath)) {
                    fs.unlinkSync(entryPath)
                    removed++
                }
            } catch (_) {}
        }
        return removed
    }

    try {
        let count = 0
        for (const entry of fs.readdirSync(tempDir)) {
            const entryPath = path.join(tempDir, entry)
            try {
                const stats = fs.statSync(entryPath)
                if (stats.isDirectory()) {
                    if (entry === 'media' || isStale(entryPath)) {
                        count += removeStaleDir(entryPath)
                    }
                } else if (isStale(entryPath)) {
                    fs.unlinkSync(entryPath)
                    count++
                }
            } catch (_) {}
        }
        if (count > 0) {
            logger.info(`🧹 Limpeza temporária: ${count} arquivos antigos removidos de ${tempDir}`)
        }
    } catch (err) {
        logger.error('Erro na limpeza de arquivos temporários:', err)
    }
}

/**
 * Converte uma figurinha WebP em imagem (estática) ou vídeo MP4 em alta resolução (animada)
 * @param {Buffer} buffer - Buffer do WebP da figurinha
 * @param {boolean} [isAnimatedHint=false] - Sugestão se a figurinha é animada vinda do Baileys
 * @returns {Promise<{ type: 'image' | 'video', buffer: Buffer, isGif?: boolean }>}
 */
async function converterFigurinhaParaMidia(buffer, isAnimatedHint = false) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error("Buffer de figurinha inválido.");
    }

    let isAnimated = Boolean(isAnimatedHint);

    // 1. Verificação direta por headers e chunks WebP VP8X / ANIM / ANMF
    if (!isAnimated && buffer.length > 20 && buffer.slice(0, 4).toString() === "RIFF" && buffer.slice(8, 12).toString() === "WEBP") {
        if (buffer.slice(12, 16).toString() === "VP8X") {
            const flags = buffer[20];
            if (flags & 0x02) isAnimated = true;
        }
        if (!isAnimated && (buffer.indexOf(Buffer.from("ANIM")) !== -1 || buffer.indexOf(Buffer.from("ANMF")) !== -1)) {
            isAnimated = true;
        }
    }

    // 2. Verificação secundária via Sharp Animated Metadata
    if (!isAnimated) {
        try {
            const meta = await sharp(buffer, { animated: true }).metadata();
            if (meta.pages && meta.pages > 1) {
                isAnimated = true;
            }
        } catch (_) {}
    }

    const id = Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    // CASO 1: FIGURINHA ANIMADA ➔ CONVERTE PARA VÍDEO MP4 EM ALTA RESOLUÇÃO (720x720 / 30fps)
    if (isAnimated) {
        const inputWebpPath = path.join(tempDir, `sticker_in_${id}.webp`);
        const inputGifPath = path.join(tempDir, `sticker_in_${id}.gif`);
        const outputMp4Path = path.join(tempDir, `sticker_out_${id}.mp4`);

        const cleanup = () => {
            try { if (fs.existsSync(inputWebpPath)) fs.unlinkSync(inputWebpPath); } catch (_) {}
            try { if (fs.existsSync(inputGifPath)) fs.unlinkSync(inputGifPath); } catch (_) {}
            try { if (fs.existsSync(outputMp4Path)) fs.unlinkSync(outputMp4Path); } catch (_) {}
        };

        const runCmd = (cmd) => new Promise((resolve) => {
            exec(cmd, (err) => resolve(!err && fs.existsSync(outputMp4Path) && fs.statSync(outputMp4Path).size > 0));
        });

        // Método A: Converter WebP para GIF animado com Sharp, e então GIF para MP4 via FFmpeg
        try {
            const gifBuffer = await sharp(buffer, { animated: true }).gif().toBuffer();
            fs.writeFileSync(inputGifPath, gifBuffer);
            const okA = await runCmd(`ffmpeg -y -i "${inputGifPath}" -vf "scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast -movflags +faststart -r 30 "${outputMp4Path}"`);
            if (okA) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (_) {}

        // Método B: FFmpeg direto com libwebp_anim
        try {
            fs.writeFileSync(inputWebpPath, buffer);
            const okB = await runCmd(`ffmpeg -y -vcodec libwebp_anim -i "${inputWebpPath}" -vf "scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast -movflags +faststart -r 30 "${outputMp4Path}"`);
            if (okB) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (_) {}

        // Método C: FFmpeg padrão de entrada WebP
        try {
            if (!fs.existsSync(inputWebpPath)) fs.writeFileSync(inputWebpPath, buffer);
            const okC = await runCmd(`ffmpeg -y -i "${inputWebpPath}" -vf "scale=720:720:force_original_aspect_ratio=decrease,pad=720:720:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset fast -movflags +faststart -r 30 "${outputMp4Path}"`);
            if (okC) {
                const videoBuffer = fs.readFileSync(outputMp4Path);
                cleanup();
                return { type: "video", buffer: videoBuffer, isGif: true };
            }
        } catch (_) {}

        cleanup();
    }

    // CASO 2: FIGURINHA ESTÁTICA ➔ CONVERTE PARA IMAGEM PNG FULL HD (1080x1080)
    try {
        const imgBuffer = await sharp(buffer)
            .resize(1080, 1080, { fit: "inside", withoutEnlargement: false })
            .png({ quality: 100 })
            .toBuffer();

        return {
            type: "image",
            buffer: imgBuffer
        };
    } catch (sharpErr) {
        const inputPath = path.join(tempDir, `sticker_static_in_${id}.webp`);
        const outputPath = path.join(tempDir, `sticker_static_out_${id}.png`);
        fs.writeFileSync(inputPath, buffer);

        return new Promise((resolve, reject) => {
            exec(`ffmpeg -y -i "${inputPath}" -vf "scale=1080:1080:force_original_aspect_ratio=decrease" "${outputPath}"`, (err) => {
                try {
                    if (!err && fs.existsSync(outputPath)) {
                        const pngBuf = fs.readFileSync(outputPath);
                        resolve({ type: "image", buffer: pngBuf });
                    } else {
                        reject(sharpErr);
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
                    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (_) {}
                }
            });
        });
    }
}

module.exports = {
    downloadWhatsAppMedia,
    criarFigurinha,
    converterFigurinhaParaMidia,
    limparArquivosTemporarios
}
