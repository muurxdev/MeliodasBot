/**
 * Comando .comparar / .compare / .comparartexto
 * Compara dois textos e mostra diferenças
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

module.exports = {
    name: "comparartexto",
    aliases: ["compare", "diferencas"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Compara dois textos e mostra semelhanças e diferenças",
    cooldownMs: 5000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text || !text.includes("|")) {
            return reply("❌ *Use o formato:* `.comparar texto1 | texto2`\n\n📌 Separe os textos com `|`");
        }

        const [text1, text2] = text.split("|").map(t => t.trim());

        if (!text1 || !text2) {
            return reply("❌ *Informe dois textos para comparar!*");
        }

        try {
            await reply("🔄 *Comparando textos...*");

            const prompt = `Compare os dois textos abaixo. Mostre semelhanças, diferenças e conclusão:\n\nTexto 1: ${text1}\n\nTexto 2: ${text2}`;
            const response = await askAI(prompt);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   🔄 *COMPARAÇÃO* 🔄   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += response;
            doc += `\n\n💡 _Análise por IA_\n👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[COMPARAR] Erro ao comparar:", err);
            return reply("❌ Erro ao comparar: " + err.message);
        }
    }
};
