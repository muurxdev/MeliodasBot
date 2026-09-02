const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const lojaItens = {
    'vip dev': { nome: 'VIP DEV', preco: 500 },
    'react master': { nome: 'React Master', preco: 1000 },
    'node wizard': { nome: 'Node Wizard', preco: 1500 },
    'full stack': { nome: 'Full Stack', preco: 2000 },
    'mochila pequena': { nome: '🎒 Mochila Pequena', preco: 500, espaco: 10 },
    'mochila media': { nome: '🎒 Mochila Média', preco: 1200, espaco: 25 },
    'mochila grande': { nome: '🎒 Mochila Grande', preco: 2500, espaco: 50 },
    'mochila lendaria': { nome: '🎒 Mochila Lendária', preco: 5000, espaco: 100 }
}

module.exports = {
    name: 'buy',
    aliases: ['comprar'],
    category: 'economy',
    description: 'Compra um item da loja (.shop)',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('❌ Use: .buy nome\nExemplo: .buy mochila pequena')
        }

        const produto = lojaItens[text.toLowerCase().trim()]
        if (!produto) {
            return reply('❌ Item não encontrado na loja. Use .shop para ver os itens disponíveis.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!Number.isFinite(user.coins) || user.coins < 0) {
            user.coins = 0
        }

        if (user.coins < produto.preco) {
            return reply('❌ Coins insuficientes.\n\n💰 Você tem: ' + user.coins + ' coins\n🛒 Preço: ' + produto.preco + ' coins')
        }

        user.coins -= produto.preco

        if (produto.espaco) {
            user.mochila = (user.mochila || 20) + produto.espaco
            await dataService.saveXpData(xpData)
            logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

            return reply('✅ *Mochila Comprada!*\n\n' + produto.nome + '\n📦 +' + produto.espaco + ' espaços\n🎒 Espaço total: ' + user.mochila + '\n💰 Coins restantes: ' + user.coins)
        }

        if (!user.inventario) user.inventario = []
        if (user.inventario.length >= (user.mochila || 20)) {
            return reply('❌ Sua mochila está cheia. Use .buy mochila pequena ou venda itens com .vender loot')
        }

        user.inventario.push(produto.nome)
        await dataService.saveXpData(xpData)
        logger.info('[SHOP] User ' + sender + ' comprou ' + produto.nome)

        return reply('✅ *Item Comprado!*\n\n' + produto.nome + '\n💰 Preço: ' + produto.preco + ' coins\n💰 Coins restantes: ' + user.coins)
    }
}