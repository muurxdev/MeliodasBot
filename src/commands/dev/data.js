module.exports = {
    name: 'data',
    aliases: ['date', 'hoje'],
    category: 'dev',
    description: 'Exibe a data atual do servidor',
    execute: async ({ reply }) => {
        const data = new Date().toLocaleDateString('pt-BR')
        await reply('📅 *Data atual:* ' + data)
    }
}