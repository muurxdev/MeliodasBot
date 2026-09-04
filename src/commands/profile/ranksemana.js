const dataService = require('../../services/dataService')
const { getCargo } = require('../../utils/helpers')

module.exports = {
    name: 'ranksemana',
    aliases: ['topsemana', 'semanal'],
    category: 'profile',
    description: 'Exibe o top 10 usuários com maior XP acumulado na semana',
    execute: async ({ reply }) => {
        const ranking = dataService.userRepo.getTopWeekly(10)

        if (ranking.length === 0) {
            return reply('📅 Nenhum usuário com XP semanal registrado ainda.')
        }

        let textoRank = '📅 *TOP RANKING SEMANAL*\n\n'
        const mentions = []

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            const cargo = getCargo(user[1].level)
            mentions.push(user[0])

            textoRank += medalha + ' *#' + (i + 1) + '* @' + user[0].split('@')[0] + '\n⭐ *XP Semanal:* ' + (user[1].weeklyXp || 0) + '\n📈 *Nível:* ' + user[1].level + ' | 🎖️ *Patente:* ' + cargo + '\n\n'
        })

        await reply(textoRank, mentions)
    }
}