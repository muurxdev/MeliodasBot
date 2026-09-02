const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'daily',
    aliases: ['diario', 'recompensa'],
    category: 'profile',
    description: 'Resgata sua recompensa diária de XP e Coins (cooldown 24h)',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const agora = Date.now()
        const ultimoDaily = user.lastDaily || 0
        const COOLDOWN_24H = 86400000

        if (agora - ultimoDaily < COOLDOWN_24H) {
            const tempoRestante = COOLDOWN_24H - (agora - ultimoDaily)
            const horas = Math.floor(tempoRestante / 3600000)
            const minutos = Math.floor((tempoRestante % 3600000) / 60000)
            return reply('⏳ Você já resgatou seu prêmio diário hoje.\n\n🕒 Volte em *' + horas + 'h ' + minutos + 'm*.')
        }

        user.lastDaily = agora
        user.xp = (user.xp || 0) + 50
        user.coins = (user.coins || 0) + 100
        user.streak = (user.streak || 0) + 1

        await dataService.saveXpData(xpData)
        logger.info('[DAILY] User ' + sender + ' resgatou daily (+50 XP, +100 Coins, Streak: ' + user.streak + ')')

        await reply('🎁 *DAILY RESGATADO COM SUCESSO!*\n\n⭐ *+50 XP*\n💰 *+100 Coins*\n🔥 *Streak diário:* ' + user.streak + ' dias seguidos!')
    }
}