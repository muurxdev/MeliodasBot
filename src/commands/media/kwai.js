/**
 * Comando .kwai
 * Download de vídeos e carrosséis do Kwai em alta resolução
 */

const fs = require('fs');
const { downloadKwaiVideo } = require('../../services/media/providers/kwai');
const { formatMediaCaption } = require('../../services/media/formatResolver');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const logger = require('../../core/logger');
const { enviarAudio } = require('../../services/media/audioSender');

module.exports = {
    name: 'kwai',
    aliases: ['kwaivideo', 'kwaidl', 'kwaidownload'],
    category: 'media',
    description: 'Baixa vídeos e fotos do Kwai em alta resolução',
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const rawInput = (text || quotedText || '').trim();
        const { url: cleanUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!cleanUrl) {
            return reply('❌ Envie o link do vídeo do Kwai.\n\n📌 *Exemplos:*\n• `.kwai https://www.kwai.com/...` (Vídeo na melhor qualidade)\n• `.kwai mp3 https://www.kwai.com/...` (Áudio MP3)');
        }

        await reply(isMp3 ? '🧡 *Extraindo áudio MP3 do Kwai...* Aguarde.' : '🧡 *Baixando vídeo/mídia do Kwai...* Aguarde.');

        try {
            const mediaData = await mediaQueue.enqueue({
                url: cleanUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadKwaiVideo(cleanUrl)
            });

            // 1. CARROSSEL DE FOTOS DO KWAI
            if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                const total = mediaData.images.length;
                let carrosselCard = "╔══════════════════════════════╗\n";
                carrosselCard += "║   📸 *CARROSSEL DO KWAI DETECTADO* 📸   ║\n";
                carrosselCard += "╚══════════════════════════════╝\n\n";
                carrosselCard += "📦 *Total de Fotos:* *" + total + " imagens em resolução original*\n";
                carrosselCard += "🎬 *Título:* " + mediaData.title + "\n";
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
                            caption: "📸 *Item " + (i + 1) + "/" + total + "* — " + mediaData.title
                        }, { quoted: info });
                    } catch (_) {}
                }
                return;
            }

            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: 'Kwai',
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
                    await enviarAudio({
                        client, from, info,
                        filePath: mp3Out,
                        fileName: (mediaData.title || "audio").slice(0, 30) + ".mp3",
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mp3Out); } catch (_) {}
                }
            } else {
                await client.sendMessage(from, { video: { url: mediaData.filePath }, caption, mimetype: 'video/mp4' }, { quoted: info, mediaUploadTimeoutMs: 180000 });
            }

            try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            logger.info("[KWAI] Mídia enviada para " + sender);
        } catch (err) {
            logger.error('[KWAI ERROR]', err);
            return reply("❌ *Erro no download do Kwai:* " + err.message);
        }
    }
};
