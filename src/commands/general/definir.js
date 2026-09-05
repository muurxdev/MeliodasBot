/**
 * Comando .definir — Mostra a definição/significado de uma palavra ou termo
 */
module.exports = {
    name: "definir",
    aliases: [],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Mostra a definição/significado de uma palavra ou termo",
    cooldownMs: 3000,
    execute: async ({ text, reply }) => {
            const term = String(text || '').trim()
            if (!term) return reply('📖 *Definir*\n\nUso: `.definir <palavra ou termo>`')
            try {
                const url = `https://api.duckduckgo.com/?q=${encodeURIComponent('define ' + term)}&format=json&no_html=1&skip_disambig=1`
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(url, { signal: ctl.signal }); clearTimeout(to)
                const j = await r.json()
                let def = j.AbstractText || j.Definition
                if (!def && Array.isArray(j.RelatedTopics)) { const t0 = j.RelatedTopics.find(x => x && x.Text); if (t0) def = t0.Text }
                if (def) return reply(`📖 *${term}*\n\n${def}${j.AbstractURL ? '\n\n🔗 ' + j.AbstractURL : ''}`)
            } catch (e) { /* cai no fallback */ }
            try { const { askAI } = require('../../services/aiService'); return reply(await askAI('o que significa ' + term)) }
            catch (e) { return reply('❌ Não encontrei uma definição agora.') }
        }
};
