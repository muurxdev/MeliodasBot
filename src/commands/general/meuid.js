module.exports = {
    name: 'meuid',
    aliases: ['myid', 'jid'],
    category: 'general',
    description: 'Exibe o seu ID ou o ID do usuário mencionado',
    execute: async ({ info, sender, reply }) => {
        const alvoId = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        await reply('🆔 *ID:*\n' + alvoId)
    }
}