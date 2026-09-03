/**
 * Comando .botcancel
 * Cancela qualquer agendamento futuro de fechamento ou abertura do bot
 */

const { cancelActiveSchedule } = require('../../services/botScheduler')
const { ROLES } = require('../../services/permissionService')

module.exports = {
    name: 'botcancel',
    aliases: ['cancelarschedule', 'cancelarfechamento'],
    category: 'owner',
    description: 'Cancela agendamentos futuros de fechamento ou reabertura do bot',
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ reply }) => {
        const cancelled = cancelActiveSchedule()

        if (cancelled) {
            await reply('✅ *AGENDAMENTO CANCELADO!*\n\nTodos os agendamentos futuros foram removidos e o bot permanece em estado normal *ONLINE*.')
        } else {
            await reply('ℹ️ Não havia nenhum agendamento ativo pendente para cancelamento.')
        }
    }
}
