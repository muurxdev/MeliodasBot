/**
 * Comando .ytmp4
 * Download direto de vídeo em MP4 na melhor qualidade do YouTube com otimização mobile
 */

const fs = require('fs')
const path = require('path')
const { extractMetadata, downloadMedia, looksLikeUrl } = require('../../services/mediaEngine')
const { getPlatformDisplayName, formatMediaCaption, formatDownloadProgressCard } = require('../../services/media/formatResolver')
const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor')
const { mediaQueue } = require('../../services/mediaQueue')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const { enviarVideo } = require('../../services/media/videoSender')

module.exports = {
    name: 'ytmp4',
    aliases: ['ytvideo', 'ytv', 'youtubevideo'],
    category: 'media',
    description: 'Baixa vídeos do YouTube em MP4 na melhor qualidade disponível',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        if (!text) {
            return reply('❌ Digite o nome do vídeo ou o link do YouTube.\n\n📌 *Exemplo:* `.ytmp4 tutorial nodejs`')
        }

        const platformName = getPlatformDisplayName(text)
        const initialCard = formatDownloadProgressCard({
            platform: platformName,
            isAudio: false,
            quality: 'Máxima disponível'
        })
        await reply(initialCard)

        try {
            const meta = await extractMetadata(text, { isSearch: !looksLikeUrl(text) })
            const targetUrl = meta.webpageUrl || meta.url || text

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format: 'mp4',
                user: sender,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: 'mp4',
                    format: 'mp4'
                })
            })

            let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo de vídeo não encontrado após o download.')
            }

            // Otimização para reprodução no WhatsApp Mobile
            filePath = await ensureMobileVideoCompatibility(filePath)

            const stats = fs.statSync(filePath)
            const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)
            const cleanTitle = (meta.title || 'video_youtube').replace(/[\\/:*?"<>|]/g, '_').slice(0, 50)

            const caption = formatMediaCaption({
                filePath,
                elapsedMs: downloaded.elapsedMs,
                platform: platformName,
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: targetUrl,
                isAudio: false
            })

            try {
                                // Entrega na galeria sempre que possível; comprime se não couber,
                // e só vira documento em último caso (ou com a flag -doc).
                await enviarVideo({
                    client, from, filePath, caption, info,
                    fileName: `${cleanTitle}.mp4`,
                    preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                })
                logger.info(`[YTMP4] Vídeo (${sizeMb} MB) enviado para ${sender}: ${meta.title}`)
            } finally {
                try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (_) {}
            }
        } catch (err) {
            logger.error('[YTMP4 ERROR]', err)
            await reply(`❌ *Erro no download do vídeo:* ${err.message}`)
        }
    }
}
