/**
 * Comando .insta
 * Download direto de Reels, Posts e Carrosséis do Instagram
 */

const fs = require('fs');
const { extractMetadata, downloadMedia } = require('../../services/mediaEngine');
const { mediaQueue } = require('../../services/mediaQueue');
const { extractUrlAndFormat } = require('../../services/media/urlExtractor');
const { formatMediaCaption } = require('../../services/media/formatResolver');
const logger = require('../../core/logger');
const { enviarAudio } = require('../../services/media/audioSender');

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
            return reply('❌ Informe um link válido do Instagram.\n\n📌 *Exemplos:*\n• `.insta https://www.instagram.com/reel/C_xxxxxx/` (Vídeo na melhor qualidade ou Carrossel)\n• `.insta mp3 https://www.instagram.com/reel/C_xxxxxx/` (Áudio MP3)');
        }

        await reply(isMp3 ? '📸 *Extraindo áudio MP3 do Instagram...* Aguarde.' : '📸 *Baixando Reels/Post do Instagram...* Aguarde.');

        try {
            const meta = await extractMetadata(queryUrl);

            const downloaded = await mediaQueue.enqueue({
                url: meta.webpageUrl,
                format: isMp3 ? 'mp3' : 'mp4',
                user: sender,
                runFn: () => downloadMedia({
                    url: meta.webpageUrl,
                    source: meta.webpageUrl,
                    format: isMp3 ? 'mp3' : 'mp4',
                    requestedFormat: isMp3 ? 'mp3' : 'mp4',
                    requestedQuality: 'best'
                })
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

            const { ensureMobileVideoCompatibility } = require('../../services/media/mediaProcessor');
            const { enviarVideo } = require('../../services/media/videoSender');

            let finalFilePath = downloaded.filePath;
            if (!isMp3) {
                finalFilePath = await ensureMobileVideoCompatibility(downloaded.filePath);
            }

            const caption = formatMediaCaption({
                filePath: finalFilePath,
                elapsedMs: downloaded.elapsedMs,
                platform: 'Instagram',
                title: meta.title,
                author: meta.author,
                durationFormatted: meta.durationFormatted,
                url: meta.webpageUrl,
                isAudio: isMp3
            });

            try {
                if (isMp3) {
                    await enviarAudio({
                        client, from, info,
                        filePath: finalFilePath,
                        fileName: (meta.title || "instagram").slice(0, 30) + ".mp3",
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } else {
                    const cleanTitle = (meta.title || "instagram").replace(/[\\/:*?"<>|]/g, "_").slice(0, 50);
                    await enviarVideo({
                        client, from, filePath: finalFilePath, caption, info,
                        fileName: `${cleanTitle}.mp4`,
                        preferirDocumento: /(^|\s)-?doc(umento)?(\s|$)/i.test(String(text || ''))
                    });
                }
                logger.info("[INSTA] Mídia enviada para " + sender);
            } finally {
                try { if (downloaded.filePath && fs.existsSync(downloaded.filePath)) fs.unlinkSync(downloaded.filePath); } catch (_) {}
                try { if (finalFilePath && finalFilePath !== downloaded.filePath && fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath); } catch (_) {}
            }
        } catch (err) {
            logger.error('[INSTA ERROR]', err);
            await reply("❌ *Erro no download do Instagram:* " + err.message);
        }
    }
};
