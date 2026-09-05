/**
 * Comando .expedicao — atividade de progressão do RPG.
 * Recompensa em XP proporcional ao próximo nível (ver rpgActivityService).
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const ativ = require('../../services/rpgActivityService')

module.exports = {
    name: 'expedicao',
    aliases: ['expedir','jornada'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Expedição de Longa Data',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const cd = ativ.checarCooldown(user, 'expedicao', 10800000)
        if (!cd.pronto) {
            return reply('🧭 *Você ainda está se recuperando.*\n\n⏳ Volte em *' + ativ.formatarEspera(cd.restanteMs) + '*.')
        }

        const nivel = user.level || 1
        const xpGanho = ativ.calcularXpAtividade(nivel, 0.20)
        const coinsGanho = ativ.calcularCoinsAtividade(nivel, 260)

        user.xp = (user.xp || 0) + xpGanho
        user.coins = (user.coins || 0) + coinsGanho
        ativ.marcarUso(user, 'expedicao')
        dataService.saveUser(user)

        let doc = '🧭 *Expedição de Longa Data*\n\n'
        doc += '⭐ *XP ganho:* +' + xpGanho.toLocaleString('pt-BR') + '\n'
        doc += '💰 *Coins:* +' + coinsGanho.toLocaleString('pt-BR') + '\n'
        doc += '📈 *Nível atual:* ' + nivel + '\n'
        doc += '⏳ *Disponível de novo em:* 3h'
        return reply(doc)
    }
}
