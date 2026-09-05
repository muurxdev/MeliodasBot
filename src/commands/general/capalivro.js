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
        if (!q) return reply('🖼️ *Capa de livro*\n\n📌 *Uso:* `.capalivro <título ou autor>`\n💡 *Exemplo:* `.capalivro Dom Casmurro`')

        const { getBotName } = require('../../config/botConfig')
        const botName = getBotName()

        try {
            const ctl = new AbortController()
            const to = setTimeout(() => ctl.abort(), 12000)
            const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1&fields=title,author_name,cover_i,isbn,first_publish_year`, {
                signal: ctl.signal,
                headers: { 'User-Agent': 'MeliodasBot/3.0' }
            })
            clearTimeout(to)

            const j = await r.json()
            const d = (j.docs || [])[0]
            if (!d) return reply(`❌ Nenhum livro encontrado para: *${q}*`)

            let cover = d.cover_i
                ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
                : (d.isbn && d.isbn[0] ? `https://covers.openlibrary.org/b/isbn/${d.isbn[0]}-L.jpg` : null)

            const authors = (d.author_name || ['Desconhecido']).slice(0, 3).join(', ')
            const year = d.first_publish_year ? ` (${d.first_publish_year})` : ''

            let caption = `╔══════════════════════════════╗\n`
            caption += `║     📖 *CAPA DO LIVRO* 📖     ║\n`
            caption += `╚══════════════════════════════╝\n\n`
            caption += `╭━〔 📚 *DETALHES DA OBRA* 〕━⬣\n`
            caption += `┃ 📝 *Título:* ${d.title}${year}\n`
            caption += `┃ ✍️ *Autor:* ${authors}\n`
            if (d.isbn && d.isbn[0]) caption += `┃ 🔢 *ISBN:* ${d.isbn[0]}\n`
            caption += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            caption += `👑 *${botName}*`

            if (!cover) {
                return reply(`${caption}\n\n⚠️ _(Nenhuma capa oficial de alta resolução disponível nesta edição)_`)
            }

            try {
                return await client.sendMessage(from, { image: { url: cover }, caption }, { quoted: info })
            } catch (e2) {
                return reply(`${caption}\n🖼️ *Link da Capa:* ${cover}`)
            }
        } catch (e) {
            return reply('❌ Serviço de consulta de livros indisponível no momento. Tente novamente mais tarde.')
        }
    }
};
