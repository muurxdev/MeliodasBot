/**
 * Comando .buscarlivro — Busca livros por título e lista autor e ano
 */
module.exports = {
    name: "buscarlivro",
    aliases: ["acharlivro","procurarlivro"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Busca livros por título e lista autor e ano",
    cooldownMs: 4000,
    execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('📚 *Buscar livro*\n\nUso: `.buscarlivro <título>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=title,author_name,first_publish_year`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const docs = j.docs || []
                if (!docs.length) return reply('📚 Nenhum livro encontrado para: *' + q + '*')
                let doc = `📚 *Resultados para:* ${q}\n\n`
                docs.forEach((d, i) => { doc += `*${i + 1}.* ${d.title}\n✍️ ${(d.author_name || ['Autor desconhecido']).slice(0, 2).join(', ')}${d.first_publish_year ? ' • ' + d.first_publish_year : ''}\n\n` })
                return reply(doc.trim())
            } catch (e) { return reply('❌ Busca de livros indisponível agora.') }
        }
};
