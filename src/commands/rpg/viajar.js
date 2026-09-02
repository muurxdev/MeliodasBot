const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'viajar',
    aliases: ['irpara', 'travel'],
    category: 'rpg',
    description: 'Viaja para outro mundo desbloqueado',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('❌ Use: .viajar [nome_do_mundo]\nExemplo: .viajar servidor')

        const destino = text.toLowerCase().trim()
        if (!mundos[destino]) return reply('❌ Mundo não encontrado. Use .mundo para ver os mundos disponíveis.')

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (user.level < mundos[destino].minLevel) {
            return reply('🚫 *ACESSO BLOQUEADO!*\n\n🌍 *Mundo:* ' + mundos[destino].nome + '\n📈 *Seu nível:* ' + user.level + '\n🔓 *Nível necessário:* ' + mundos[destino].minLevel)
        }

        user.mundo = destino
        await dataService.saveXpData(xpData)
        logger.info('[VIAJAR] User ' + sender + ' viajou para ' + destino)

        await reply('✅ *Você viajou para:*\n\n' + mundos[destino].nome)
    }
}