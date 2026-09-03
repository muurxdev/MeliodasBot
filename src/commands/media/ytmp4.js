/**
 * Comando .ytmp4
 * Download direto de vídeo em formato MP4 HD do YouTube com otimização mobile
 */

const fs = require('fs')
const path = require('path')
const { extractMetadata, downloadMedia, looksLikeUrl } = require('../../services/mediaEngine')
const { getPlatformDisplayName, formatMediaCaption, formatDownloadProgressCard } = require('../../services/media/formatResolver')
const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor')
const { mediaQueue } = require('../../services/mediaQueue')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'ytmp4',
    aliases: ['ytvideo', 'ytv', 'youtubevideo'],
    category: 'media',
    description: 'Baixa vídeos do YouTube em formato MP4 HD',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        if (!text) {
            return reply('❌ Digite o nome do vídeo ou o link do YouTube.\n\n📌 *Exemplo:* `.ytmp4 tutorial nodejs`')
        }

        const platformName = getPlatformDisplayName(text)
        const initialCard = formatDownloadProgressCard({
            platform: platformName,
            isAudio: false,
            estimatedTime: '~5 a 15 seg',
            quality: '1080p Full HD'
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

            const videoBuf = fs.readFileSync(filePath)

            if (stats.size <= 100 * 1024 * 1024) {
                await client.sendMessage(from, {
                    video: videoBuf,
                    caption,
                    mimetype: 'video/mp4'
                }, { quoted: info })
            } else {
                await client.sendMessage(from, {
                    document: videoBuf,
                    mimetype: 'video/mp4',
                    fileName: `${cleanTitle}.mp4`,
                    caption: `${caption}\n\n📦 *Enviado como documento (${sizeMb} MB) para manter 100% da qualidade HD original.*`
                }, { quoted: info })
            }

            try { fs.unlinkSync(filePath) } catch (_) {}
            logger.info(`[YTMP4] Vídeo (${sizeMb} MB) enviado para ${sender}: ${meta.title}`)
        } catch (err) {
            logger.error('[YTMP4 ERROR]', err)
            await reply(`❌ *Erro no download do vídeo:* ${err.message}`)
        }
    }
}
