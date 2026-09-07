/**
 * Comando .resumo / .summarize / .resumir
 * Resume um texto de forma clara e objetiva
 */

const { getBotName } = require("../../config/botConfig");
const { askAI } = require("../../services/aiService");
const logger = require("../../core/logger");

function resumirLocal(texto) {
    const limpo = String(texto || '').trim();
    // Divide por sentenças completas
    const frases = limpo
        .split(/(?<=[.!?])\s+/)
        .map(f => f.trim())
        .filter(f => f.length > 20);

    if (frases.length <= 2) {
        return limpo;
    }

    const selecionadas = [
        frases[0],
        frases.length > 4 ? frases[Math.floor(frases.length / 2)] : null,
        frases[frases.length - 1]
    ].filter(Boolean);

    return selecionadas.join('\n\n');
}

module.exports = {
    name: "resumo",
    aliases: ["summarize", "sumario", "resumotexto"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Resume um texto de forma clara e objetiva",
    cooldownMs: 4000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();

        if (!text) {
            return reply("❌ *Informe o texto para resumir!*\n\n📌 *Exemplo:* `.resumo [texto]`");
        }

        try {
            await reply("🔄 *Gerando resumo...*");

            const llm = require("../../services/llmService");
            let resposta = null;

            if (llm.hasProvider() && String(text).trim().length > 50) {
                try {
                    resposta = await llm.resumir(String(text).trim());
                } catch (_) {}
            }

            if (!resposta) {
                resposta = resumirLocal(text);
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║       📝 *RESUMO* 📝       ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 📄 TEXTO RESUMIDO 〕━⬣\n`;
            doc += `${resposta}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        } catch (err) {
            logger.error("[RESUMO] Erro ao gerar resumo:", err);
            return reply("❌ Erro ao gerar resumo: " + err.message);
        }
    }
};
