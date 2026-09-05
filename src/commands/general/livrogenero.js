/**
 * Comando .livrogenero — Lista livros populares de um gênero/assunto (ex.: fantasy, romance, history)
 */
module.exports = {
    name: "livrogenero",
    aliases: ["livrosgenero","generolivro"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Lista livros populares de um gênero/assunto (ex.: fantasy, romance, history)",
    cooldownMs: 4000,
    execute: async ({ text, reply }) => {
            const q = String(text || '').trim().toLowerCase().replace(/\s+/g, '_')
            if (!q) return reply('🏷️ *Livros por gênero*\n\nUso: `.livrogenero <assunto>`\nEx.: `fantasy`, `romance`, `science_fiction`, `history`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(q)}.json?limit=8`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const works = j.works || []
                if (!works.length) return reply('🏷️ Nada encontrado para o gênero: *' + q.replace(/_/g, ' ') + '*\n💡 Tente em inglês (fantasy, romance, history...).')
                let doc = `🏷️ *Gênero:* ${(j.name || q.replace(/_/g, ' '))}\n\n`
                works.slice(0, 8).forEach((w, i) => { doc += `*${i + 1}.* ${w.title}\n✍️ ${(w.authors || []).map(a => a.name).slice(0, 2).join(', ') || '—'}\n\n` })
                return reply(doc.trim())
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
};
