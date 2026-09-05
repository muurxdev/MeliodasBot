/**
 * Comando .explicar — Explica um assunto de forma simples (pesquisa em tempo real)
 */
module.exports = {
    name: "explicar",
    aliases: ["explique","eli5"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Explica um assunto de forma simples (pesquisa em tempo real)",
    cooldownMs: 4000,
    execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🧠 *Explicar*\n\nUso: `.explicar <assunto>`')
            try { const { askAI } = require('../../services/aiService'); return reply(await askAI('explique de forma simples e resumida: ' + q)) }
            catch (e) { return reply('❌ Não consegui explicar agora.') }
        }
};
