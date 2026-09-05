/**
 * Comando .classify / .classificar / .categoriartexto
 * Classifica um texto em categorias
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

module.exports = {
    name: "classify",
    aliases: ["classificar", "categoriartexto", "tagtext"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Classifica um texto em categorias (notícia, opinião, fato, etc)",
    cooldownMs: 5000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para classificar!*\n\n📌 *Exemplo:* `.classify [texto]`");
        }

        try {
            await reply("🔄 *Classificando texto...*");

            const prompt = `Classifique o texto abaixo em categorias. Responda com as categorias (ex: notícia, opinião, fato, científico, humor, etc) e uma breve explicação:\n\n${text}`;
            const response = await askAI(prompt);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🏷️ *CLASSIFICAÇÃO* 🏷️   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += response;
            doc += `\n\n💡 _Classificação por IA_\n👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[CLASSIFY] Erro ao classificar:", err);
            return reply("❌ Erro ao classificar: " + err.message);
        }
    }
};
