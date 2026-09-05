/**
 * Comando .resumo / .summarize / .resumir
 * Resume um texto ou artigo usando IA
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

module.exports = {
    name: "resumo",
    aliases: ["summarize", "sumario", "resumotexto"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Resume um texto ou artigo usando inteligência artificial",
    cooldownMs: 5000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para resumir!*\n\n📌 *Exemplo:* `.resumo [texto ou URL]`");
        }

        // Com uma IA configurada (Groq/Gemini/Cloudflare), o resumo é de verdade.
        // Sem chave, segue o método heurístico abaixo.
        try {
            const llm = require("../../services/llmService");
            if (llm.hasProvider() && String(text).trim().length > 60) {
                const r = await llm.resumir(String(text).trim());
                if (r) return reply("📝 *RESUMO*\n\n" + r + "\n\n👑 *" + botName + "*");
            }
        } catch (e) {
            /* segue no método padrão */
        }

        try {
            await reply("🔄 *Gerando resumo...*");

            const prompt = `Resuma o seguinte texto em poucos parágrafos claros e objetivos em português:\n\n${text}`;
            const response = await askAI(prompt);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║   📝 *RESUMO IA* 📝   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += response;
            doc += `\n\n💡 _Gerado por IA_\n👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[RESUMO] Erro ao gerar resumo:", err);
            return reply("❌ Erro ao gerar resumo: " + err.message);
        }
    }
};
