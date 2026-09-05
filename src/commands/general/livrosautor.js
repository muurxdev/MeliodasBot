/**
 * Comando .livrosautor — Lista livros de um autor
 */
module.exports = {
    name: "livrosautor",
    aliases: ["livrosdoautor"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Lista livros de um autor",
    cooldownMs: 4000,
    execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('✍️ *Livros por autor*\n\nUso: `.livrosautor <nome do autor>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(q)}&limit=8&fields=title,first_publish_year`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const docs = j.docs || []
                if (!docs.length) return reply('✍️ Nenhum livro encontrado para o autor: *' + q + '*')
                const seen = new Set(); let doc = `✍️ *Livros de:* ${q}\n\n`; let n = 0
                for (const d of docs) { if (seen.has(d.title)) continue; seen.add(d.title); n++; doc += `${n}. ${d.title}${d.first_publish_year ? ' (' + d.first_publish_year + ')' : ''}\n`; if (n >= 8) break }
                return reply(doc.trim())
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
};
