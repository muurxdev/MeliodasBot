/**
 * MeliodasBot — Comando .botschedule
 * Consulta o status operacional atual e os agendamentos ativos do ciclo de vida
 */

const { getScheduleStatusCard } = require('../../services/botScheduler')
const { ROLES } = require('../../services/permissionService')

module.exports = {
    name: 'botschedule',
    aliases: ['schedulestatus', 'horariobot', 'statusbot'],
    category: 'owner',
    description: 'Exibe o status operacional atual do bot e os horários de fechamento/reabertura programados',
    minRole: ROLES.BOT_ADMIN,
    execute: async ({ reply }) => {
        const card = getScheduleStatusCard()
        await reply(card)
    }
}
