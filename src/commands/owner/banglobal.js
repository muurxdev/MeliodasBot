const securityService = require('../../services/securityService')

module.exports = {
    name: 'banglobal',
    aliases: ['blockuser', 'banir', 'ban-global', 'banirglobal'],
    category: 'owner',
    description: 'Bane um usuário globalmente do bot (adiciona à Blacklist). Para remover do grupo use .ban',
    ownerOnly: true,
    execute: async ({ info, args, sender, reply }) => {
        const target = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0]
        if (!target) {
            return reply('❌ Informe o usuário para banir. Exemplo: .ban @usuario [motivo]')
        }

        const cleanJid = target.includes('@') ? target : `${target}@s.whatsapp.net`
        const motivo = args.slice(1).join(' ') || 'Violação das regras'

        securityService.banUser(cleanJid, motivo, sender)
        await reply(`🚫 *USUÁRIO BANIDO DO BOT!*

👤 *JID:* ${cleanJid}
📝 *Motivo:* ${motivo}
👮 *Autor:* @${sender.split('@')[0]}`, [sender])
    }
}

