const logger = require('../../core/logger')
const groupAuthService = require('../../services/groupAuthService')
const groupControlService = require('../../services/groupControlService')

module.exports = {
    name: 'abrirgrupo',
    aliases: ['abrir', 'abrirg', 'abregrupo', 'destrancar', 'opengroup', 'destrancargrupo'],
    category: 'admin',
    description: 'Reabre o grupo (todos podem falar) e cancela o agendamento de fechamento',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ from, client, reply }) => {
        try {
            const groupData = await groupAuthService.getGroupData(from, { refresh: true })
            if (!groupData.isBotAdmin) {
                return reply('❌ O bot não é administrador deste grupo. Promova o bot para executar esta ação.')
            }

            await groupControlService.openGroup(client, from)
            logger.info(`[ABRIRGRUPO] Grupo ${from} reaberto por admin`)

            return reply('🔓 *GRUPO REABERTO!*\n\n✅ Todos os membros podem enviar mensagens novamente.')
        } catch (err) {
            logger.error('[ABRIRGRUPO ERROR]', err)
            return reply(`❌ *Falha ao reabrir o grupo:* ${err.message}`)
        }
    }
}