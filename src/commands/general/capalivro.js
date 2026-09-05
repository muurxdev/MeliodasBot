/**
 * Comando .capalivro — Envia a capa de um livro pelo título
 */
module.exports = {
    name: "capalivro",
    aliases: ["capa","coverlivro"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Envia a capa de um livro pelo título",
    cooldownMs: 5000,
    execute: async ({ text, reply, client, from, info }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🖼️ *Capa de livro*\n\nUso: `.capalivro <título>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1&fields=title,author_name,cover_i,isbn`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const d = (j.docs || [])[0]
                if (!d) return reply('🖼️ Livro não encontrado: *' + q + '*')
                let cover = d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : (d.isbn && d.isbn[0] ? `https://covers.openlibrary.org/b/isbn/${d.isbn[0]}-L.jpg` : null)
                const caption = `📖 *${d.title}*\n✍️ ${(d.author_name || ['—']).slice(0, 2).join(', ')}`
                if (!cover) return reply(caption + '\n\n(sem capa disponível)')
                try { return await client.sendMessage(from, { image: { url: cover }, caption }, { quoted: info }) }
                catch (e2) { return reply(caption + '\n🖼️ ' + cover) }
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
};
