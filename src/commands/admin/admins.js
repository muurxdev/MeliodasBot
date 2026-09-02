const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'admins',
    aliases: ['admlist', 'listadm', 'administradores', 'listaradmins', 'mods'],
    category: 'admin',
    description: 'Lista os administradores do grupo',
    groupOnly: true,
    execute: async ({ from, client, reply }) => {
        let groupData
        try {
            groupData = await groupAuthService.getGroupData(from)
        } catch (err) {
            return reply('❌ *Falha na autenticação do grupo!* Não foi possível buscar os administradores do WhatsApp. Tente novamente.')
        }

        const { admins, isBotAdmin } = groupData
        if (!admins || admins.size === 0) {
            return reply('⚠️ Não foi possível obter a lista de administradores deste grupo.')
        }

        const botJids = groupAuthService.getBotJids(client)

        const lines = Array.from(admins).map(jid => {
            const isBot = botJids.has(groupAuthService.normalizeJid(jid))
            return `${isBot ? '🤖 *BOT* — ' : '👤 '}@${jid.split('@')[0]}`
        })

        let text = `👑 *ADMINISTRADORES DO GRUPO*\n\n${lines.join('\n')}\n\n📊 *Total:* ${admins.size}`
        text += isBotAdmin
            ? '\n✅ O *bot é admin* deste grupo e pode executar .promote/.demote'
            : '\n⚠️ O *bot NÃO é admin* deste grupo ainda'

        return reply(text, Array.from(admins))
    }
}