/**
 * Comando .nobg / .removerbg / .removebg
 * Remove o fundo de imagens
 */

const { getBotName } = require("../../config/botConfig");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const sharp = require("sharp");
const logger = require("../../core/logger");

module.exports = {
    name: "nobg",
    aliases: ["removerbg", "removebg", "semfundo"],
    category: "media",
    subcategory: "Imagens & Edição",
    description: "Remove o fundo de uma imagem (simplificado)",
    cooldownMs: 5000,
    execute: async ({ sender, info, reply, client }) => {
        const botName = getBotName();

        try {
            const quotedMsg = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = info?.message?.imageMessage || quotedMsg?.imageMessage;

            if (!isImage) {
                return reply("❌ *Responda a uma imagem para remover o fundo!*");
            }

            await reply("🔄 *Removendo fundo...*");

            const msgToDownload = quotedMsg || info.message;
            const buffer = await downloadMediaMessage(msgToDownload, "buffer", {});

            const pngBuffer = await sharp(buffer)
                .png()
                .toBuffer();

            await client.sendMessage(sender, {
                image: pngBuffer,
                caption: `✅ *Fundo removido!*\n👑 *${botName}*`
            });

            return;
        } catch (err) {
            logger.error("[NOBG] Erro ao remover fundo:", err);
            return reply("❌ Erro ao remover fundo: " + err.message);
        }
    }
};
