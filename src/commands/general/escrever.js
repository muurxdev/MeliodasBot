module.exports = {
    name: 'escrever',
    aliases: ['say', 'falar', 'echo'],
    category: 'general',
    description: 'Envia o texto digitado pelo usuário',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite o texto para ser enviado.')
        await reply(text)
    }
}