/**
 * Comando .paraphrase / .parafrasear / .reescrver
 * Parafraseia um texto usando IA
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

module.exports = {
    name: "paraphrase",
    aliases: ["parafrasear", "reescrver", "reformular"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Parafraseia um texto de forma diferente mantendo o sentido",
    cooldownMs: 5000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para parafrasear!*\n\n📌 *Exemplo:* `.paraphrase [texto]`");
        }

        try {
            await reply("🔄 *Parafraseando...*");

            const prompt = `Parafraseie o texto abaixo de forma diferente, mantendo o mesmo sentido. Use palavras e estruturas diferentes:\n\n${text}`;
            const response = await askAI(prompt);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🔄 *PARAFRASEADO* 🔄   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += response;
            doc += `\n\n💡 _Gerado por IA_\n👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[PARAPHRASE] Erro ao parafrasear:", err);
            return reply("❌ Erro ao parafrasear: " + err.message);
        }
    }
};
