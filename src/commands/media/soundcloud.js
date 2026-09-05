/**
 * Comando .soundcloud / .sc
 * Download de faixas e áudios do SoundCloud em MP3 de alta fidelidade
 */

const fs = require("fs");
const { searchAndDownloadAudio } = require("../../services/audioStreamService");
const { mediaQueue } = require("../../services/mediaQueue");
const { formatMediaCaption } = require("../../services/media/formatResolver");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const { enviarAudio } = require('../../services/media/audioSender');

module.exports = {
    name: "soundcloud",
    aliases: ["sc", "sound", "soundcloudmusic", "scdl"],
    category: "media",
    description: "Baixa músicas e sets do SoundCloud em alta fidelidade (MP3)",
    cooldownMs: 3000,
    execute: async ({ text, from, info, client, reply, sender }) => {
        const botName = getBotName();
        const rawInput = (text || "").trim();

        if (!rawInput) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🟠 *SOUNDCLOUD MUSIC HUB* 🟠   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• `.soundcloud <nome da música>` — Buscar e baixar faixa no SoundCloud\n";
            doc += "• `.soundcloud <link do soundcloud>` — Baixar diretamente pelo link\n\n";
            doc += "📝 *Exemplos:*\n";
            doc += "👉 `.soundcloud Alan Walker Faded`\n";
            doc += "👉 `.soundcloud https://soundcloud.com/artist/track-name`\n\n";
            doc += "👑 *" + botName + "*";
            return reply(doc.trim());
        }

        await reply(`🟠 *Processando áudio no SoundCloud:* _${rawInput.slice(0, 40)}_... Aguarde.`);

        try {
            const mediaData = await mediaQueue.enqueue({
                url: rawInput,
                format: "mp3",
                user: sender,
                runFn: () => searchAndDownloadAudio(rawInput)
            });

            const cleanFileName = mediaData.title.replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 35);
            const caption = formatMediaCaption({
                filePath: mediaData.filePath,
                elapsedMs: mediaData.elapsedMs,
                platform: "SoundCloud",
                title: mediaData.title,
                author: mediaData.author,
                durationFormatted: mediaData.durationFormatted,
                url: mediaData.url,
                isAudio: true
            });

            if (mediaData.thumbnail) {
                try {
                    await client.sendMessage(from, { image: { url: mediaData.thumbnail }, caption }, { quoted: info });
                } catch (_) {}
            }

            if (fs.existsSync(mediaData.filePath)) {
                try {
                    await enviarAudio({
                        client, from, info,
                        filePath: mediaData.filePath,
                        fileName: `${cleanFileName}.mp3`,
                        preferirPartes: /(^|\s)-?partes?(\s|$)/i.test(String(text || ''))
                    });
                } finally {
                    try { fs.unlinkSync(mediaData.filePath); } catch (_) {}
                }
            }

            logger.info(`[SOUNDCLOUD] Áudio enviado para ${sender}: ${mediaData.title}`);
        } catch (err) {
            logger.error("[SOUNDCLOUD ERROR]", err);
            return reply(`❌ *Erro ao baixar do SoundCloud:* ${err.message}`);
        }
    }
};

