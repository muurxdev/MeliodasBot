/**
 * Comando .youtube / .yt / .ytb
 * Central inteligente de download do YouTube (Vídeo MP4 na melhor qualidade por padrão ou Áudio MP3 com --mp3)
 * Compatível 100% com WhatsApp Mobile (Android/iOS) e Web
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
    name: 'youtube',
    aliases: ['yt', 'ytb', 'ytdl', 'ytvideo'],
    category: 'media',
    description: 'Baixa vídeos e músicas do YouTube (padrão MP4 HD). Use --mp3 para áudio.',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info }) => {
        const botName = getBotName()
        if (!text) {
            return reply(
                '❌ *Informe o link ou nome do vídeo do YouTube!*\n\n' +
                '📌 *Exemplos:*\n' +
                '• `.youtube https://youtu.be/cBpUZJ0qxqs` → Baixa vídeo MP4 HD\n' +
                '• `.youtube https://youtu.be/cBpUZJ0qxqs --mp3` → Baixa áudio em MP3\n' +
                '• `.youtube Nanatsu no Taizai AMV` → Pesquisa e baixa vídeo HD'
            )
        }

        const isAudio = text.includes('--mp3') || text.includes('--audio')
        const format = isAudio ? 'mp3' : 'mp4'
        const cleanQuery = text.replace(/--(mp3|mp4|video|audio)/gi, '').trim()
        const platformName = getPlatformDisplayName(cleanQuery)

        // Envia card interativo com estimativa de tempo imediata
        const initialCard = formatDownloadProgressCard({
            platform: platformName,
            isAudio,
            quality: isAudio ? null : 'Máxima disponível'
        })
        await reply(initialCard)

        try {
            const meta = await extractMetadata(cleanQuery, { isSearch: !looksLikeUrl(cleanQuery) })
            const targetUrl = meta.webpageUrl || meta.url || cleanQuery

            const downloaded = await mediaQueue.enqueue({
                url: targetUrl,
                format,
                user: sender,
                runFn: () => downloadMedia({
                    source: targetUrl,
                    url: targetUrl,
                    requestedFormat: format,
                    format
                })
            })

            let filePath = downloaded.filePath || downloaded.primaryFile || (downloaded.files && downloaded.files[0])
            if (!filePath || !fs.existsSync(filePath)) {
                throw new Error('Arquivo não foi gerado ou está corrompido.')
            }

            // Otimização de compatibilidade para WhatsApp Mobile (H.264 + AAC + yuv420p + faststart)
            if (!isAudio) {
                filePath = await ensureMobileVideoCompatibility(filePath)
            }

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
                isAudio
            })

            const buf = fs.readFileSync(filePath)

            if (isAudio) {
                if (meta.thumbnail) {
                    try {
                        await client.sendMessage(from, { image: { url: meta.thumbnail }, caption }, { quoted: info })
                    } catch (_) {}
                }
                await client.sendMessage(from, {
                    audio: buf,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `${cleanTitle}.mp3`
                }, { quoted: info })
            } else {
                // Se o arquivo for menor/igual a 100MB, envia como vídeo reproduzível nativo
                if (stats.size <= 100 * 1024 * 1024) {
                    await client.sendMessage(from, {
                        video: buf,
                        caption,
                        mimetype: 'video/mp4'
                    }, { quoted: info })
                } else {
                    // Arquivos grandes (> 100MB até 2GB): envia como documento MP4 HD sem perda
                    await client.sendMessage(from, {
                        document: buf,
                        mimetype: 'video/mp4',
                        fileName: `${cleanTitle}.mp4`,
                        caption: `${caption}\n\n📦 *Enviado como documento (${sizeMb} MB) para manter 100% da qualidade HD original.*`
                    }, { quoted: info })
                }
            }

            try { fs.unlinkSync(filePath) } catch (_) {}
            logger.info(`[YOUTUBE] ${format.toUpperCase()} (${sizeMb} MB) enviado para ${sender}: ${meta.title}`)
        } catch (err) {
            logger.error('[YOUTUBE ERROR]', err)
            await reply(`❌ *Erro no download do YouTube:* ${err.message}`)
        }
    }
}
