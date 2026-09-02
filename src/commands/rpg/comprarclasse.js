const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classes } = require('../../utils/constants')
const logger = require('../../core/logger')

const precosClasses = {
    arquimago: 800,
    guardiao: 800,
    bughunter: 1000,
    nuvem: 1000,
    ia: 1500,
    hacker: 1500,
    fullstack: 2000,
    necromante: 2500
}

module.exports = {
    name: 'comprarclasse',
    aliases: ['mudarclasse', 'adquirirclasse'],
    category: 'rpg',
    description: 'Compra e equipa uma nova classe utilizando coins (.classeshop)',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('❌ Use: .comprarclasse [nome]\nExemplo: .comprarclasse fullstack')

        const classeEscolhida = text.toLowerCase().trim()
        if (!classes[classeEscolhida] || !precosClasses[classeEscolhida]) {
            return reply('❌ Classe inválida. Use .classeshop para ver as disponíveis.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const preco = precosClasses[classeEscolhida]
        if ((user.coins || 0) < preco) {
            return reply('❌ Coins insuficientes.\n\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\n🏷️ Preço da classe: ' + preco + ' coins')
        }

        user.coins -= preco
        user.classe = classeEscolhida
        user.bugPower = 0

        await dataService.saveXpData(xpData)
        logger.info('[COMPRARCLASSE] User ' + sender + ' comprou classe ' + classeEscolhida)

        await reply('🎉 *CLASSE COMPRADA E EQUIPADA!*\n\n' + classes[classeEscolhida].nome + '\n\n💰 Coins restantes: ' + user.coins)
    }
}