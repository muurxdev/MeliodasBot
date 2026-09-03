/**
 * Comando .pinterest
 * Download de imagens em alta resolução, vídeos MP4 e extração de áudio MP3 do Pinterest
 */

const fs = require("fs");
const { downloadPinterestMedia } = require("../../services/pinterestService");
const { formatMediaCaption } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const logger = require("../../core/logger");

module.exports = {
    name: "pinterest",
    aliases: ["pin", "pindl", "pint", "pinterestvideo", "pinterestfoto"],
    category: "media",
    description: "Baixa imagens originais, vídeos em HD e áudio MP3 do Pinterest",
    cooldownMs: 3000,
    execute: async ({ text, quotedText, from, info, client, reply, sender }) => {
        const rawInput = (text || quotedText || "").trim();
        if (!rawInput) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    📌 *PINTEREST DOWNLOAD* 📌    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• \`.pinterest <link>\` — Baixar imagem original ou vídeo em HD\n";
            doc += "• \`.pinterest mp3 <link>\` — Extrair áudio em MP3 do vídeo\n";
            doc += "• \`.pinterest <pesquisa>\` — Buscar imagens e wallpapers\n\n";
            doc += "📝 *Exemplos:*\n";
            doc += "👉 \`.pinterest https://pin.it/xxxxxx\`\n";
            doc += "👉 \`.pinterest Meliodas 4k wallpaper\`";
            return reply(doc.trim());
        }

        const { url: cleanUrl, isMp3, cleanQuery } = extractUrlAndFormat(rawInput);
        const target = cleanUrl || cleanQuery;

        await reply("📌 *Processando Pinterest...* Aguarde.");

        try {
            const mediaData = await mediaQueue.enqueue({
                url: target,
                format: isMp3 ? "mp3" : "mp4",
                user: sender,
                runFn: () => downloadPinterestMedia(target, { format: isMp3 ? "mp3" : "mp4" })
            });

            // CARROSSEL DO PINTEREST
            if (mediaData.images && Array.isArray(mediaData.images) && mediaData.images.length > 1) {
                const total = mediaData.images.length;
                let carrosselCard = "╔══════════════════════════════╗\n";
                carrosselCard += "║   📸 *CARROSSEL DO PINTEREST* 📸   ║\n";
                carrosselCard += "╚══════════════════════════════╝\n\n";
                carrosselCard += "📦 *Total de Fotos:* *" + total + " imagens HD*\n";
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
                platform: "Pinterest",
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                isAudio: isMp3
            });

            if (mediaData.isVideo) {
                const videoBuf = fs.readFileSync(mediaData.filePath);
                await client.sendMessage(from, { video: videoBuf, caption, mimetype: "video/mp4" }, { quoted: info });
            } else if (mediaData.isAudio) {
                const audioBuf = fs.readFileSync(mediaData.filePath);
                if (mediaData.thumbnail) {
                    try {
                        await client.sendMessage(from, { image: { url: mediaData.thumbnail }, caption }, { quoted: info });
                    } catch (_) {}
                }
                await client.sendMessage(from, {
                    audio: audioBuf,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: (mediaData.title || "audio").slice(0, 30) + ".mp3"
                }, { quoted: info });
            } else {
                const imgBuf = fs.readFileSync(mediaData.filePath);
                await client.sendMessage(from, { image: imgBuf, caption }, { quoted: info });
            }

            try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            logger.info("[PINTEREST] Mídia enviada para " + sender + ": " + mediaData.title);
        } catch (err) {
            logger.error("[PINTEREST ERROR]", err);
            return reply("❌ *Erro no download do Pinterest:* " + err.message);
        }
    }
};
