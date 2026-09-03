/**
 * Media Uploader Service
 * Camada desacoplada para envio de mídias (áudio, vídeo, imagem, galerias) via Baileys
 */

const fs = require('fs')
const path = require('path')
const { MEDIA_ERRORS, FORMATS } = require('./constants')
const logger = require('../../core/logger')
const { getBotName } = require('../../config/botConfig')

/**
 * Envia o resultado do download para o chat do WhatsApp
 * @param {object} params
 * @param {object} params.client - Socket Baileys
 * @param {string} params.from - JID do destinatário/grupo
 * @param {object} params.job - Job do Media Engine
 * @param {object} params.downloadResult - Resultado do mediaDownloader
 * @param {object} [params.info] - Mensagem original cotada
 * @returns {Promise<object>}
 */
async function uploadMedia({ client, from, job, downloadResult, info = null }) {
    if (!client || !from) {
        const err = new Error('Cliente ou destinatário do WhatsApp não informado.')
        err.code = MEDIA_ERRORS.UPLOAD_FAILED
        throw err
    }

    const { filePath, files, isGallery, format, mimeType } = downloadResult
    const metadata = job.metadata || {}
    const title = metadata.title || 'Mídia'
    const author = metadata.author || ''
    const duration = metadata.durationFormatted || ''

    try {
        if (isGallery && files && files.length > 1) {
            // Envio de Galeria com múltiplos itens
            for (let i = 0; i < files.length; i++) {
                const itemFile = files[i]
                const itemBuf = fs.readFileSync(itemFile)
                const isVideo = itemFile.endsWith('.mp4') || itemFile.endsWith('.webm')

                const caption = i === 0 ? `📦 *Galeria (${files.length} itens)*\n📌 *${title}*\n👤 *${author}*` : ''

                if (isVideo) {
                    await client.sendMessage(from, {
                        video: itemBuf,
                        caption,
                        mimetype: 'video/mp4'
                    }, { quoted: i === 0 ? info : undefined })
                } else {
                    await client.sendMessage(from, {
                        image: itemBuf,
                        caption
                    }, { quoted: i === 0 ? info : undefined })
                }

                // Pequeno delay para evitar rate limit de uploads
                if (i < files.length - 1) {
                    await new Promise(r => setTimeout(r, 400))
                }
            }

            return { success: true, type: 'gallery', count: files.length }
        }

        const buffer = fs.readFileSync(filePath)

        if (format === FORMATS.MP3 || format === FORMATS.M4A) {
            const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').slice(0, 35)
            const audioPayload = {
                audio: buffer,
                mimetype: 'audio/mp4',
                ptt: false,
                fileName: `${cleanTitle}.${format}`
            }

            if (metadata.thumbnail) {
                audioPayload.contextInfo = {
                    externalAdReply: {
                        title: title.slice(0, 60),
                        body: author ? `Artista: ${author}` : `${getBotName()} Official Audio`,
                        mediaType: 2,
                        thumbnailUrl: metadata.thumbnail,
                        sourceUrl: metadata.url || 'https://youtube.com',
                        renderLargerThumbnail: true
                    }
                }
            }

            await client.sendMessage(from, audioPayload, { quoted: info })

            return { success: true, type: 'audio', format }
        }

        // Formato de Vídeo
        const caption = `🎬 *${title}*\n\n👤 *Autor:* ${author}\n⏱️ *Duração:* ${duration}`
        await client.sendMessage(from, {
            video: buffer,
            caption: caption.trim(),
            mimetype: 'video/mp4'
        }, { quoted: info })

        return { success: true, type: 'video', format: 'mp4' }
    } catch (err) {
        logger.error('[MEDIA UPLOAD ERROR]', err)
        const uploadErr = new Error(`Falha no upload da mídia para o WhatsApp: ${err.message}`)
        uploadErr.code = MEDIA_ERRORS.UPLOAD_FAILED
        throw uploadErr
    }
}

module.exports = {
    uploadMedia
}

