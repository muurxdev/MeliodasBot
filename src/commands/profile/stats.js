const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')

module.exports = {
    name: 'stats',
    aliases: ['estatisticas', 'pvpstats'],
    category: 'profile',
    description: 'Exibe estatísticas de combate, vitórias e derrotas',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const wins = user.wins || 0
        const losses = user.losses || 0
        const total = wins + losses
        const taxa = total > 0 ? ((wins / total) * 100).toFixed(1) : 0

        const texto = '⚔️ *ESTATÍSTICAS DE COMBATE*\n\n🏆 *Vitórias:* ' + wins + '\n💀 *Derrotas:* ' + losses + '\n📊 *Total de Duelos:* ' + total + '\n📈 *Taxa de Vitória:* ' + taxa + '%'

        await reply(texto)
    }
}