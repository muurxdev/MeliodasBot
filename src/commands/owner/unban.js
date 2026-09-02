const securityService = require('../../services/securityService')

module.exports = {
    name: 'unban',
    aliases: ['desbanir', 'unblockuser'],
    category: 'owner',
    description: 'Desbane um usuário da Blacklist global do bot',
    ownerOnly: true,
    execute: async ({ info, args, reply }) => {
        const target = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
        if (!target) {
            return reply('❌ Informe o usuário para desbanir. Exemplo: .unban @usuario ou .unban 551199999999')
        }

        const cleanJid = target.includes('@') ? target : `${target}@s.whatsapp.net`

        securityService.unbanUser(cleanJid)
        await reply(`✅ *Usuário desbanido com sucesso:* ${cleanJid}`)
    }
}

