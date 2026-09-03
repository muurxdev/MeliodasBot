const securityService = require('../../services/securityService')

module.exports = {
    name: 'blacklist',
    aliases: ['banidos'],
    category: 'owner',
    description: 'Consulta todos os usuários atualmente na Blacklist global',
    ownerOnly: true,
    execute: async ({ reply }) => {
        const bans = securityService.getBannedUsers()
        if (bans.length === 0) {
            return reply('🛡️ Nenhum usuário banido no momento.')
        }

        let texto = `🚫 *LISTA NEGRA GLOBAL (${bans.length} banidos)*\n\n`
        bans.forEach((b, i) => {
            texto += `*#${i + 1}* ${b.jid}\n📝 *Motivo:* ${b.motivo}\n📅 *Data:* ${b.created_at}\n\n`
        })

        await reply(texto)
    }
}

