const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

module.exports = {
    name: 'mochila',
    aliases: ['bag', 'backpack'],
    category: 'economy',
    description: 'Exibe a capacidade da mochila ou faz upgrade de espaço (.mochila up)',
    execute: async ({ text, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const capacidade = user.mochila || 20
        const ocupado = user.inventario?.length || 0

        if (!text) {
            const precoUpgrade = capacidade * 20
            return reply('🎒 *SUA MOCHILA*\n\n📦 *Espaços ocupados:* ' + ocupado + ' / ' + capacidade + '\n\n💰 *Melhorar capacidade:*\nUse: .mochila up\n📌 Cada upgrade concede +10 espaços.\n💵 Preço do próximo nível: ' + precoUpgrade + ' coins')
        }

        if (text.toLowerCase() === 'up') {
            const preco = capacidade * 20
            if ((user.coins || 0) < preco) {
                return reply('❌ Coins insuficientes para upgrade.\n\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\n💵 Necessário: ' + preco + ' coins')
            }

            user.coins -= preco
            user.mochila = capacidade + 10
            await dataService.saveXpData(xpData)
            logger.info('[MOCHILA] User ' + sender + ' fez upgrade de mochila para ' + user.mochila)

            return reply('🎉 *MOCHILA MELHORADA COM SUCESSO!*\n\n📦 Nova capacidade: ' + user.mochila + ' espaços\n💰 Coins restantes: ' + user.coins)
        }

        return reply('❌ Opção inválida. Use: .mochila ou .mochila up')
    }
}