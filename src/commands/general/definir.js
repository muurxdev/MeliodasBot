/**
 * Comando .definir — Mostra a definição e significado de uma palavra ou termo
 */

const { askAI, searchWiki } = require('../../services/aiService')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: "definir",
    aliases: ["definir-cmd", "cmd-definir", "significado", "dicionario"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Mostra a definição e significado de uma palavra ou termo",
    cooldownMs: 3000,
    execute: async ({ text, reply }) => {
        const term = String(text || '').trim()
        if (!term) return reply('📖 *Definir*\n\nUso: `.definir <palavra ou termo>`')

        const botName = getBotName()

        // 1. Tenta DuckDuckGo dictionary definition
        try {
            const url = `https://api.duckduckgo.com/?q=${encodeURIComponent('define ' + term)}&format=json&no_html=1&skip_disambig=1`
            const ctl = new AbortController()
            const to = setTimeout(() => ctl.abort(), 8000)
            const r = await fetch(url, { signal: ctl.signal })
            clearTimeout(to)
            const j = await r.json()
            let def = j.AbstractText || j.Definition
            if (!def && Array.isArray(j.RelatedTopics)) {
                const t0 = j.RelatedTopics.find(x => x && x.Text)
                if (t0) def = t0.Text
            }
            if (def && def.length > 20) {
                let doc = `📖 *${term.toUpperCase()}*\n\n${def}\n\n👑 *${botName}*`
                return reply(doc.trim())
            }
        } catch (_) {}

        // 2. Tenta Wikipedia enciclopédica
        try {
            const wiki = await searchWiki(term)
            if (wiki && wiki.extract && wiki.extract.length > 20) {
                let doc = `📖 *${wiki.title.toUpperCase()}*\n\n${wiki.extract}\n\n👑 *${botName}*`
                return reply(doc.trim())
            }
        } catch (_) {}

        // 3. Fallback inteligente via askAI
        try {
            const def = await askAI(`Defina e explique de forma clara e direta o que significa: ${term}`)
            if (def) {
                let doc = `📖 *${term.toUpperCase()}*\n\n${def}\n\n👑 *${botName}*`
                return reply(doc.trim())
            }
        } catch (_) {}

        return reply('❌ Não encontrei uma definição para este termo no momento.')
    }
}
