const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')

module.exports = {
    name: 'rankcoins',
    aliases: ['topcoins', 'ricos'],
    category: 'profile',
    description: 'Exibe o top 10 usuários mais ricos do bot',
    execute: async ({ reply }) => {
        const ranking = dataService.userRepo.getTopCoins(10)

        if (ranking.length === 0) {
            return reply('💰 Nenhum usuário registrado no ranking ainda.')
        }

        let textoRank = '💰 *TOP RANKING DE COINS*\n\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            const cargo = getCargo(user[1].level)
            mentions.push(user[0])

            textoRank += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\n💰 *Coins:* ' + (user[1].coins || 0) + '\n📈 *Nível:* ' + user[1].level + ' | 💼 *Cargo:* ' + cargo + '\n\n'
        })

        await reply(textoRank, mentions)
    }
}