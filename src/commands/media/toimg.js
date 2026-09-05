/**
 * Comando .toimg / .stickertoimg / .figtoimg
 * Converte figurinha para imagem
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "toimg",
    aliases: ["stickertoimg", "figtoimg", "fig2img"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Converte uma figurinha em imagem",
    cooldownMs: 3000,
    execute: async ({ sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isSticker = quotedMsg?.stickerMessage;

            if (!isSticker) {
                return reply("❌ *Responda a uma figurinha para converter!*");
            }

            await reply("🔄 *Convertendo figurinha...*");

            const buffer = await downloadMediaMessage(quotedMsg, "buffer", {});

            const imageBuffer = await sharp(buffer)
                .resize(1080, 1080, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
                .jpeg({ quality: 90 })
                .toBuffer();

            await client.sendMessage(sender, {
                image: imageBuffer,
                caption: `✅ *Figurinha convertida!*\n👑 *${botName}*`
            });

            return;
        } catch (err) {
            logger.error("[TOIMG] Erro ao converter figurinha:", err);
            return reply("❌ Erro ao converter: " + err.message);
        }
    }
};
