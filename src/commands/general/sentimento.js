/**
 * Comando .sentimento / .sentiment / .analisarsentimento
 * Analisa o sentimento de um texto
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

module.exports = {
    name: "sentimento",
    aliases: ["sentiment", "analisarsentimento", "emoçao"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Analisa o sentimento de um texto (positivo, negativo, neutro)",
    cooldownMs: 5000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para analisar!*\n\n📌 *Exemplo:* `.sentimento [texto]`");
        }

        try {
            await reply("🔄 *Analisando sentimento...*");

            const prompt = `Analise o sentimento do texto abaixo. Responda APENAS com um emoji e uma palavra (positivo/negativo/neutro), depois uma breve explicação em português:\n\nTexto: ${text}`;
            const response = await askAI(prompt);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   💭 *ANÁLISE DE SENTIMENTO* 💭   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += response;
            doc += `\n\n💡 _Análise por IA_\n👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[SENTIMENTO] Erro ao analisar:", err);
            return reply("❌ Erro ao analisar: " + err.message);
        }
    }
};
