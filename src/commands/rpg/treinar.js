/**
 * Comando .treinar — atividade de progressão do RPG.
 * Recompensa em XP proporcional ao próximo nível (ver rpgActivityService).
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const ativ = require('../../services/rpgActivityService')

module.exports = {
    name: 'treinar',
    aliases: ['treino','trienar'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Treino de Combate',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const cd = ativ.checarCooldown(user, 'treinar', 1800000)
        if (!cd.pronto) {
            return reply('🏋️ *Você ainda está se recuperando.*\n\n⏳ Volte em *' + ativ.formatarEspera(cd.restanteMs) + '*.')
        }

        const nivel = user.level || 1
        const xpGanho = ativ.calcularXpAtividade(nivel, 0.04)
        const coinsGanho = ativ.calcularCoinsAtividade(nivel, 40)

        user.xp = (user.xp || 0) + xpGanho
        user.coins = (user.coins || 0) + coinsGanho
        ativ.marcarUso(user, 'treinar')
        dataService.saveUser(user)

        let doc = '🏋️ *Treino de Combate*\n\n'
        doc += '⭐ *XP ganho:* +' + xpGanho.toLocaleString('pt-BR') + '\n'
        doc += '💰 *Coins:* +' + coinsGanho.toLocaleString('pt-BR') + '\n'
        doc += '📈 *Nível atual:* ' + nivel + '\n'
        doc += '⏳ *Disponível de novo em:* 30min'
        return reply(doc)
    }
}
