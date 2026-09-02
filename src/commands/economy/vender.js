const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const precosLoot = {
    '🟢 Fragmento de Bug': 20,
    '🟢 Asa Corrompida': 25,
    '🪲 Casca Binária': 35,
    '🌿 Gosma de Código': 45,
    '🔥 Log Perdido': 80,
    '💾 Arquivo Quebrado': 100,
    '📡 Sinal Perdido': 130,
    '🧯 Fragmento de Firewall': 150,
    '🕷️ Dados Roubados': 180,
    '🔓 Chave Digital': 220,
    '👁️ Lente Sombria': 260,
    '🧬 Gene Corrompido': 320,
    '🐉 Escama Binária': 400,
    '👁️ Olho Ancestral': 500,
    '🗿 Pedra de Script': 650,
    '⚔️ Lâmina Algorítmica': 800
}

module.exports = {
    name: 'vender',
    aliases: ['sell'],
    category: 'economy',
    description: 'Vende todos os loots de monstros coletados para obter coins',
    execute: async ({ text, sender, reply }) => {
        if (text !== 'loot') {
            return reply('❌ Use: .vender loot')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.inventario || user.inventario.length === 0) {
            return reply('📦 Seu inventário está vazio.')
        }

        let total = 0
        const vendidos = []

        user.inventario = user.inventario.filter(item => {
            if (precosLoot[item]) {
                total += precosLoot[item]
                vendidos.push(item)
                return false
            }
            return true
        })

        if (total <= 0) {
            return reply('❌ Você não possui loots de mobs vendíveis no seu inventário.')
        }

        user.coins = (user.coins || 0) + total
        await dataService.saveXpData(xpData)
        logger.info('[VENDER] User ' + sender + ' vendeu ' + vendidos.length + ' loots por ' + total + ' coins')

        await reply('💰 *LOOTS VENDIDOS COM SUCESSO!*\n\n📦 *Itens vendidos:*\n' + vendidos.map(i => '• ' + i).join('\n') + '\n\n💵 *Total recebido:* +' + total + ' coins\n💰 *Saldo atual:* ' + user.coins + ' coins')
    }
}