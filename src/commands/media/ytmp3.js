/**
 * Comando .ytmp3
 * Download direto de áudio em formato MP3 do YouTube
 */

const fs = require('fs')
const { extractMetadata, downloadMedia, looksLikeUrl } = require('../../services/mediaEngine')
const { formatMediaCaption, formatDownloadProgressCard } = require('../../services/media/formatResolver')
const { mediaQueue } = require('../../services/mediaQueue')
const logger = require('../../core/logger')

module.exports = {
    name: 'ytmp3',
    aliases: ['musica', 'audio', 'song', 'ytaudio'],
    category: 'media',
    description: 'Baixa músicas e áudios do YouTube em formato MP3 de alta fidelidade',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        if (!text) {
            return reply('❌ Digite o nome da música ou o link do YouTube.\n\n📌 *Exemplo:* `.ytmp3 Linkin Park In The End`')
        }

        const initialCard = formatDownloadProgressCard({
            platform: 'YouTube',
            isAudio: true
        })
        await reply(initialCard)

        try {
            const meta = await extractMetadata(text, { isSearch: !looksLikeUrl(text) })
            const targetUrl = meta.webpageUrl || meta.url || text

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format: 'mp3',
                user: sender,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: 'mp3',
                    format: 'mp3'
                })
            })

            const filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo de áudio não foi gerado ou está corrompido.')
            }

            const caption = formatMediaCaption({
                filePath,
                elapsedMs: downloaded.elapsedMs,
                platform: 'YouTube',
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: targetUrl,
                isAudio: true
            })

            if (meta.thumbnail) {
                try {
                    const { upgradeThumbnail } = require('../../services/media/thumbnailResolver')
                    meta.thumbnail = await upgradeThumbnail(meta.thumbnail)
                    await client.sendMessage(from, { image: { url: meta.thumbnail }, caption }, { quoted: info })
                } catch (_) {}
            }

            const cleanTitle = (meta.title || 'audio_youtube').replace(/[\\/:*?"<>|]/g, '_').slice(0, 40)

            try {
                await client.sendMessage(from, {
                    audio: { url: filePath },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${cleanTitle}.mp3`
                }, { quoted: info, mediaUploadTimeoutMs: 180000 })
                logger.info(`[YTMP3] Áudio enviado com sucesso para ${sender}: ${meta.title}`)
            } finally {
                try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (_) {}
            }
        } catch (err) {
            logger.error('[YTMP3 ERROR]', err)
            await reply(`❌ *Erro no download do áudio:* ${err.message}`)
        }
    }
}
