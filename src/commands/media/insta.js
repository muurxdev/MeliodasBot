/**
 * MeliodasBot — Comando .insta
 * Download direto de Reels, Posts e Carrosséis do Instagram
 */

const fs = require('fs');
const { extractMetadata, downloadMedia } = require('../../services/mediaEngine');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const { formatMediaCaption } = require('../../services/media/formatResolver');
const logger = require('../../core/logger');

module.exports = {
    name: 'insta',
    aliases: ['instagram', 'ig', 'reels', 'instadl'],
    category: 'media',
    description: 'Baixa vídeos de Reels, Posts e Carrosséis do Instagram',
    cooldownMs: 5000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const rawInput = (text || quotedText || '').trim();
        const { url: queryUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!queryUrl || (!queryUrl.includes('instagram.com') && !queryUrl.includes('instagr.am'))) {
            return reply('❌ Informe um link válido do Instagram.\n\n📌 *Exemplos:*\n• `.insta https://www.instagram.com/reel/C_xxxxxx/` (Vídeo HD ou Carrossel)\n• `.insta mp3 https://www.instagram.com/reel/C_xxxxxx/` (Áudio MP3)');
        }

        await reply(isMp3 ? '📸 *Extraindo áudio MP3 do Instagram...* Aguarde.' : '📸 *Baixando Reels/Post do Instagram...* Aguarde.');

        try {
            const meta = await extractMetadata(queryUrl);

            const downloaded = await mediaQueue.enqueue({
                url: meta.webpageUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadMedia({ url: meta.webpageUrl, format: isMp3 ? 'mp3' : 'mp4' })
            });

            // CARROSSEL DE MÍDIAS DO INSTAGRAM
            if (downloaded.images && Array.isArray(downloaded.images) && downloaded.images.length > 1) {
                const total = downloaded.images.length;
                let carrosselCard = "╔══════════════════════════════╗\n";
                carrosselCard += "║   📸 *CARROSSEL DO INSTAGRAM* 📸   ║\n";
                carrosselCard += "╚══════════════════════════════╝\n\n";
                carrosselCard += "📦 *Total de Itens:* *" + total + " fotos/mídias*\n";
                carrosselCard += "🎬 *Título:* " + meta.title + "\n";
                carrosselCard += "👤 *Autor:* " + meta.author + "\n";
                carrosselCard += "🔗 *Link:* " + meta.webpageUrl + "\n\n";
                carrosselCard += "⏳ _Enviando todas as fotos em alta resolução..._";

                await reply(carrosselCard.trim());

                for (let i = 0; i < total; i++) {
                    const imgUrl = downloaded.images[i];
                    try {
                        const imgRes = await fetch(imgUrl);
                        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
                        await client.sendMessage(from, {
                            image: imgBuf,
                            caption: "📸 *Item " + (i + 1) + "/" + total + "* — " + meta.title.slice(0, 45)
                        }, { quoted: info });
                    } catch (_) {}
                }
                return;
            }

            const caption = formatMediaCaption({
                filePath: downloaded.filePath,
                elapsedMs: downloaded.elapsedMs,
                platform: 'Instagram',
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: meta.webpageUrl,
                isAudio: isMp3
            });

            if (isMp3) {
                const audioBuf = fs.readFileSync(downloaded.filePath);
                await client.sendMessage(from, {
                    audio: audioBuf,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: (meta.title || "instagram").slice(0, 30) + ".mp3"
                }, { quoted: info });
            } else {
                const videoBuf = fs.readFileSync(downloaded.filePath);
                await client.sendMessage(from, {
                    video: videoBuf,
                    caption,
                    mimetype: 'video/mp4'
                }, { quoted: info });
            }

            try { fs.unlinkSync(downloaded.filePath); } catch (_) {}
            logger.info("[INSTA] Mídia enviada para " + sender);
        } catch (err) {
            logger.error('[INSTA ERROR]', err);
            await reply("❌ *Erro no download do Instagram:* " + err.message);
        }
    }
};
