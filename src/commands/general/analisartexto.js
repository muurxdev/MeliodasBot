/**
 * Comando .analisartexto — Estatísticas de um texto (palavras, frases, tempo de leitura, termos frequentes)
 */
module.exports = {
    name: "analisartexto",
    aliases: ["analisetexto","textinfo"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Estatísticas de um texto (palavras, frases, tempo de leitura, termos frequentes)",
    cooldownMs: 2500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('📊 *Analisar texto*\n\nUso: `.analisartexto <texto>`')
            const words = (t.match(/\S+/g) || []); const chars = t.length
            const noSpace = t.replace(/\s/g, '').length
            const sentences = (t.match(/[.!?]+/g) || []).length || 1; const lines = t.split(/\n/).length
            const avg = (words.reduce((a, w) => a + w.length, 0) / Math.max(1, words.length)).toFixed(1)
            const readMin = Math.max(1, Math.round(words.length / 200))
            const freq = {}; words.forEach(w => { const k = w.toLowerCase().replace(/[^a-zà-ú]/gi, ''); if (k.length > 3) freq[k] = (freq[k] || 0) + 1 })
            const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w, c]) => `${w}(${c})`).join(', ')
            return reply(`📊 *Análise do Texto*\n\n📝 Palavras: *${words.length}*\n🔤 Caracteres: *${chars}* (${noSpace} sem espaços)\n📃 Frases: *${sentences}* | Linhas: *${lines}*\n📏 Média por palavra: *${avg}* letras\n⏱️ Leitura: *~${readMin} min*\n🔝 Mais usadas: ${top || '—'}`)
        }
};
