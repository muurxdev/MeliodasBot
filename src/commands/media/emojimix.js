/**
 * Comando .emojimix
 * Combina dois emojis em uma imagem ou sticker único usando a API do Google Kitchen
 */

const { criarFigurinha } = require("../../services/mediaService");
const logger = require("../../core/logger");

module.exports = {
    name: "emojimix",
    aliases: ["mixemoji", "emojikitchen", "mix"],
    category: "media",
    description: "Combina dois emojis em uma figurinha divertida e personalizada",
    execute: async ({ args, text, from, client, info, reply }) => {
        const parts = (text || "").replace(/\s+/g, "").match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu);

        if (!parts || parts.length < 2) {
            return reply("🎨 *Uso:* Digite `.emojimix <emoji1> <emoji2>`\n👉 Exemplo: `.emojimix 😎 🤠` ou `.emojimix 🐱 🚀`");
        }

        const e1 = parts[0];
        const e2 = parts[1];

        try {
            await reply("⏳ *Misturando emojis...* Aguarde.");

            const url = `https://tenor.googleapis.com/v2/featured?key=LIVDSRZULELA&limit=1`;
            const mixUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(e1)}`;

            // Fallback Google Kitchen endpoint
            const kitchenUrl = `https://emojik.vercel.app/s/${encodeURIComponent(e1)}_${encodeURIComponent(e2)}?size=512`;

            const res = await fetch(kitchenUrl, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) {
                throw new Error("Essa combinação de emojis não está disponível no catálogo.");
            }

            const arrayBuffer = await res.arrayBuffer();
            const imgBuffer = Buffer.from(arrayBuffer);

            const stickerBuffer = await criarFigurinha(imgBuffer, false, "ᶜᴿᴬᶻᵞ𝙈𝙚𝙡𝙞𝙤𝙙𝙖𝙨✖‿✖•", `EmojiMix ${e1}+${e2}`);

            await client.sendMessage(from, {
                sticker: stickerBuffer
            }, { quoted: info });
        } catch (err) {
            logger.warn("[EMOJIMIX WARN]", err.message);
            return reply(`❌ *Não foi possível combinar ${e1} + ${e2}.* Tente outra dupla de emojis clássicos (ex: 😎 🤠 ou 🐱 🐶).`);
        }
    }
};

