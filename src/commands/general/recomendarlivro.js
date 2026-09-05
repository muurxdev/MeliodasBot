/**
 * Comando .recomendarlivro — Recomenda um livro aleatório de um gênero (ou geral)
 */
module.exports = {
    name: "recomendarlivro",
    aliases: ["indicarlivro","livrorecomendado"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Recomenda um livro aleatório de um gênero (ou geral)",
    cooldownMs: 5000,
    execute: async ({ text, reply }) => {
            const g = String(text || '').trim().toLowerCase().replace(/\s+/g, '_') || ['fantasy', 'romance', 'history', 'science_fiction', 'mystery', 'poetry', 'philosophy'][Math.floor(Math.random() * 7)]
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(g)}.json?limit=50`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const works = j.works || []
                if (!works.length) return reply('📗 Não achei recomendação p/ *' + g.replace(/_/g, ' ') + '*. Tente um gênero em inglês.')
                const w = works[Math.floor(Math.random() * works.length)]
                return reply(`📗 *Recomendação de leitura* (${(j.name || g.replace(/_/g, ' '))})\n\n📖 *${w.title}*\n✍️ ${(w.authors || []).map(a => a.name).slice(0, 2).join(', ') || '—'}${w.first_publish_year ? '\n📅 ' + w.first_publish_year : ''}`)
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
};
