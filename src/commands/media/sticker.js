/**
 * Comando .sticker / .fig / .figurinha
 * Cria figurinhas WhatsApp a partir de imagens ou vídeos curtos
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "sticker",
    aliases: ["tofig", "criarfig", "stickermaker"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Cria figurinhas WhatsApp a partir de imagens ou vídeos curtos",
    cooldownMs: 3000,
    execute: async ({ sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = info?.message?.imageMessage || quotedMsg?.imageMessage;
            const isVideo = info?.message?.videoMessage || quotedMsg?.videoMessage;

            if (!isImage && !isVideo) {
                return reply("❌ *Responda a uma imagem ou vídeo curto para criar uma figurinha!*");
            }

            await reply("🔄 *Criando figurinha...*");

            const msgToDownload = quotedMsg || info.message;
            const buffer = await downloadMediaMessage(msgToDownload, "buffer", {});

            if (isImage) {
                const stickerBuffer = await sharp(buffer)
                    .resize(512, 512, { fit: "cover" })
                    .png()
                    .toBuffer();

                await client.sendMessage(sender, {
                    sticker: stickerBuffer,
                    mimetype: "image/png"
                });
            } else {
                await client.sendMessage(sender, {
                    video: buffer,
                    mimetype: "video/mp4",
                    gifPlayback: true
                });
            }

            return reply("✅ *Figurinha criada com sucesso!*");
        } catch (err) {
            logger.error("[STICKER] Erro ao criar figurinha:", err);
            return reply("❌ Erro ao criar figurinha: " + err.message);
        }
    }
};
