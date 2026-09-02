module.exports = {
    name: 'search',
    aliases: ['stackoverflow', 'so', 'pesquisa'],
    category: 'dev',
    description: 'Pesquisa dúvidas e soluções no Stack Overflow',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite algo para pesquisar. Exemplo: .search javascript array filter')
        await reply('🔎 https://stackoverflow.com/search?q=' + encodeURIComponent(text.trim()))
    }
}