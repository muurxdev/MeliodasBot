/**
 * Comando .vigilia — atividade de progressão do RPG.
 * Recompensa em XP proporcional ao próximo nível (ver rpgActivityService).
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const ativ = require('../../services/rpgActivityService')

module.exports = {
    name: 'vigilia',
    aliases: ['vigilia','vigília'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Vigília Noturna',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const cd = ativ.checarCooldown(user, 'vigilia', 7200000)
        if (!cd.pronto) {
            return reply('🌙 *Você ainda está se recuperando.*\n\n⏳ Volte em *' + ativ.formatarEspera(cd.restanteMs) + '*.')
        }

        const nivel = user.level || 1
        const xpGanho = ativ.calcularXpAtividade(nivel, 0.12)
        const coinsGanho = ativ.calcularCoinsAtividade(nivel, 150)

        user.xp = (user.xp || 0) + xpGanho
        user.coins = (user.coins || 0) + coinsGanho
        ativ.marcarUso(user, 'vigilia')
        dataService.saveUser(user)

        let doc = '🌙 *Vigília Noturna*\n\n'
        doc += '⭐ *XP ganho:* +' + xpGanho.toLocaleString('pt-BR') + '\n'
        doc += '💰 *Coins:* +' + coinsGanho.toLocaleString('pt-BR') + '\n'
        doc += '📈 *Nível atual:* ' + nivel + '\n'
        doc += '⏳ *Disponível de novo em:* 2h'
        return reply(doc)
    }
}
