module.exports = {
    name: 'id',
    aliases: ['chatid'],
    category: 'general',
    description: 'Exibe o ID do chat ou usuário atual',
    execute: async ({ from, reply }) => {
        await reply('🆔 *ID do Chat:*\n' + from)
    }
}