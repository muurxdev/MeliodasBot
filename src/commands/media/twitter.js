/**
 * Comando .twitter
 * Download de vídeos e carrossel de fotos do Twitter / X
 */

const fs = require('fs');
const { downloadTwitterVideo } = require('../../services/media/providers/twitter');
const { formatMediaCaption } = require('../../services/media/formatResolver');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const logger = require('../../core/logger');

module.exports = {
    name: 'twitter',
    aliases: ['x', 'tw', 'tweet', 'twitterdl', 'xdl'],
    category: 'media',
    description: 'Baixa vídeos e fotos do Twitter / X em alta resolução através do link',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const rawInput = (text || quotedText || '').trim();
        const { url: queryUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!queryUrl || (!queryUrl.includes('twitter.com') && !queryUrl.includes('x.com'))) {
            return reply('❌ Informe um link válido do Twitter / X.\n\n📌 *Exemplos:*\n• `.twitter https://x.com/...` (Vídeo na melhor qualidade ou Fotos)\n• `.twitter mp3 https://x.com/...` (Áudio MP3)');
        }

        await reply(isMp3 ? '🐦 *Extraindo áudio MP3 do Twitter / X...* Aguarde.' : '🐦 *Baixando mídia do Twitter / X...* Aguarde.');

        try {
            const mediaData = await mediaQueue.enqueue({
                url: queryUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadTwitterVideo(queryUrl)
            });

            // CARROSSEL DE FOTOS DO TWITTER / X
            if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                const total = mediaData.images.length;
                let carrosselCard = "╔══════════════════════════════╗\n";
                carrosselCard += "║   📸 *CARROSSEL DO TWITTER / X* 📸   ║\n";
                carrosselCard += "╚══════════════════════════════╝\n\n";
                carrosselCard += "📦 *Total de Fotos:* *" + total + " imagens em resolução original*\n";
                carrosselCard += "🎬 *Tweet:* " + mediaData.title + "\n";
                carrosselCard += "👤 *Autor:* " + mediaData.author + "\n";
                carrosselCard += "🔗 *Link:* " + mediaData.url + "\n\n";
                carrosselCard += "⏳ _Enviando todas as fotos em alta resolução..._";

                await reply(carrosselCard.trim());

                for (let i = 0; i < total; i++) {
                    const imgUrl = mediaData.images[i];
                    try {
                        const imgRes = await fetch(imgUrl);
                        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                        await client.sendMessage(from, {
                            image: imgBuf,
                            caption: "📸 *Item " + (i + 1) + "/" + total + "* — " + mediaData.title.slice(0, 45)
                        }, { quoted: info });
                    } catch (_) {}
                }
                return;
            }

            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: 'Twitter (X)',
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                isAudio: isMp3
            });

            if (isMp3) {
                const { spawn } = require('child_process');
                const mp3Out = mediaData.filePath.replace(/\.mp4$/i, '.mp3');

                await new Promise((resolve, reject) => {
                    const ff = spawn('ffmpeg', ['-y', '-i', mediaData.filePath, '-vn', '-c:a', 'libmp3lame', '-b:a', '320k', '-ar', '48000', mp3Out]);
                    ff.on('close', code => (code === 0 ? resolve() : reject(new Error('Erro na conversão MP3'))));
                    ff.on('error', reject);
                });

                try {
                    await client.sendMessage(from, {
                        audio: { url: mp3Out },
                        mimetype: 'audio/mpeg',
                        ptt: false,
                        fileName: (mediaData.title || "twitter").slice(0, 30) + ".mp3"
                    }, { quoted: info, mediaUploadTimeoutMs: 180000 });
                } finally {
                    try { fs.unlinkSync(mp3Out); } catch (_) {}
                }
            } else {
                await client.sendMessage(from, {
                    video: { url: mediaData.filePath },
                    caption,
                    mimetype: 'video/mp4'
                }, { quoted: info, mediaUploadTimeoutMs: 180000 });
            }

            try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            logger.info("[TWITTER] Mídia enviada para " + sender);
        } catch (err) {
            logger.error('[TWITTER ERROR]', err);
            await reply("❌ *Erro no download do Twitter / X:* " + err.message);
        }
    }
};
