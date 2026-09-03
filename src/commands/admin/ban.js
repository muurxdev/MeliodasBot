/**
 * Comando .ban
 * Remove participantes do grupo com suporte a menção e número
 */

const logger = require('../../core/logger')
const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'ban',
    aliases: ['kick', 'remover', 'expulsar'],
    category: 'admin',
    description: 'Remove um participante do grupo',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 3000,
    execute: async ({ info, from, sender, args, client, reply, quotedSender }) => {
        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const target = mentioned
            || quotedSender
            || (args[0] ? args[0].replace(/[@+\s-]/g, '') + '@s.whatsapp.net' : null)

        if (!target) {
            return reply('❌ Marque o membro que deseja remover do grupo.\n\n📌 *Exemplo:* `.ban @usuario`')
        }

        if (target === sender) {
            return reply('❌ Você não pode banir a si mesmo do grupo.')
        }

        try {
            const groupData = await groupAuthService.getGroupData(from, { refresh: true })
            const targetIsAdmin = Array.from(groupData.admins).some(a => groupAuthService.sameUser(a, target))

            if (targetIsAdmin) {
                return reply('❌ Você não pode remover outro administrador do grupo.')
            }

            const apiJid = await groupAuthService.resolveMemberJid(client, target, groupData) || target

            await client.groupParticipantsUpdate(from, [apiJid], 'remove')
            groupAuthService.invalidate(from)

            logger.info(`[BAN] ${sender} removeu ${target} em ${from}`)
            return reply(`👢 *MEMBRO REMOVIDO!*\n\n👤 *Usuário:* @${target.split('@')[0]}\n🛡️ *Removido por:* @${sender.split('@')[0]}`, [target, sender])
        } catch (err) {
            logger.error('[BAN ERROR]', err)
            return reply(`❌ *Falha ao remover membro:* ${err.message}`)
        }
    }
}

