/**
 * MeliodasBot — Comando .tiktok
 * Download direto de vídeos e carrossel de fotos do TikTok em alta resolução sem marca d'água
 */

const fs = require("fs");
const { downloadTikTokVideo } = require("../../services/media/providers/tiktok");
const { formatMediaCaption } = require("../../services/media/formatResolver");
const { mediaQueue } = require("../../services/mediaQueue");
const { extractUrlAndFormat } = require("../../services/media/urlExtractor");
const logger = require("../../core/logger");

module.exports = {
    name: "tiktok",
    aliases: ["tk", "tt", "tiktokdl"],
    category: "media",
    description: "Baixa vídeos ou carrossel de fotos do TikTok em alta resolução através do link",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply, client, from, info, quotedText }) => {
        const rawInput = (text || quotedText || "").trim();
        const { url: queryUrl, isMp3 } = extractUrlAndFormat(rawInput);

        if (!queryUrl || !queryUrl.includes("tiktok.com")) {
            return reply("❌ Informe um link válido do TikTok.\n\n📌 *Exemplos:*\n• `.tiktok https://vt.tiktok.com/xxxxxx/` (Vídeo HD ou Carrossel de Fotos)\n• `.tiktok mp3 https://vt.tiktok.com/xxxxxx/` (Áudio MP3)");
        }

        await reply(isMp3 ? "🎵 *Extraindo áudio MP3 do TikTok...* Aguarde." : "🎵 *Processando mídia do TikTok sem marca d'água...* Aguarde.");

        try {
            const mediaData = await mediaQueue.enqueue({
                url: queryUrl,
                format: isMp3 ? "mp3" : "mp4",
                user: sender,
                runFn: () => downloadTikTokVideo(queryUrl)
            });

            // 1. CARROSSEL DE FOTOS / SLIDESHOW
            if (mediaData.isCarousel) {
                let card = "╔══════════════════════════════╗\n";
                card += "║   📸 *CARROSSEL DO TIKTOK* 📸   ║\n";
                card += "╚══════════════════════════════╝\n\n";
                card += "📝 *Título:* " + mediaData.title + "\n";
                card += "👤 *Criador:* " + mediaData.author + "\n";
                card += "📦 *Total de Fotos:* *" + mediaData.carouselCount + " imagens HD*\n";
                card += "🔗 *Link:* " + mediaData.url + "\n\n";
                card += "⏳ _Enviando todas as imagens do carrossel abaixo..._";

                await reply(card.trim());

                for (let idx = 0; idx < mediaData.carouselItems.length; idx++) {
                    const item = mediaData.carouselItems[idx];
                    const imgBuf = fs.readFileSync(item.path);
                    await client.sendMessage(from, {
                        image: imgBuf,
                        caption: "📸 *Item " + (idx + 1) + "/" + mediaData.carouselItems.length + "* — " + mediaData.title.slice(0, 45)
                    }, { quoted: info });
                    try { fs.unlinkSync(item.path); } catch (_) {}
                }
                return logger.info("[TIKTOK] Carrossel com " + mediaData.carouselCount + " fotos enviado para " + sender);
            }

            // 2. VÍDEO PADRÃO OU ÁUDIO MP3
            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: "TikTok",
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                isAudio: isMp3
            });

            if (isMp3) {
                const { spawn } = require("child_process");
                const mp3Out = mediaData.filePath.replace(/\.mp4$/i, ".mp3");

                await new Promise((resolve, reject) => {
                    const ff = spawn("ffmpeg", ["-y", "-i", mediaData.filePath, "-vn", "-c:a", "libmp3lame", "-b:a", "320k", "-ar", "48000", mp3Out]);
                    ff.on("close", code => (code === 0 ? resolve() : reject(new Error("Erro na conversão MP3"))));
                    ff.on("error", reject);
                });

                const audioBuf = fs.readFileSync(mp3Out);
                await client.sendMessage(from, {
                    audio: audioBuf,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: (mediaData.title || "tiktok").slice(0, 30) + ".mp3"
                }, { quoted: info });

                try { fs.unlinkSync(mp3Out); } catch (_) {}
            } else {
                const videoBuf = fs.readFileSync(mediaData.filePath);
                await client.sendMessage(from, {
                    video: videoBuf,
                    caption,
                    mimetype: "video/mp4"
                }, { quoted: info });
            }

            try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
            logger.info("[TIKTOK] Mídia enviada com sucesso para " + sender);
        } catch (err) {
            logger.error("[TIKTOK ERROR]", err);
            await reply("❌ *Erro no download do TikTok:* " + err.message);
        }
    }
};
