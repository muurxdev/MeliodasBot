const dataService = require('../../services/dataService')

module.exports = {
    name: 'warnings',
    aliases: ['avisos', 'warns'],
    category: 'admin',
    description: 'Consulta a quantidade de advertências de um usuário',
    groupOnly: true,
    execute: async ({ info, sender, reply }) => {
        const warnedUser = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const warns = dataService.getWarnsData()
        const total = warns[warnedUser] || 0

        await reply('⚠️ *Advertências de @' + warnedUser.split('@')[0] + ':*\n\n' + total + ' / 3', [warnedUser])
    }
}