const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const precosLoot = {
    // Mobs Comuns
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
    '⚔️ Lâmina Algorítmica': 800,

    // Dungeon & Masmorra
    '🦴 Crânio Amaldiçoado': 200,
    '🗡️ Adaga de Ferro Goblin': 350,
    '🌑 Fragmento de Sombra': 600,
    '🛡️ Brasão de Ferro Real': 1000,
    '🔥 Escama de Dragão Ancestral': 2000,
    '🩸 Sangue Demoníaco Puro': 3000,
    '🪽 Pluma Celestial Sagrada': 4000,
    '👑 Coroa do Soberano Sombrio': 5000,
    '✨ Orbe da Graça Imortal': 6000,
    '🌌 Centelha do Caos Infinito': 10000,

    // Loots de Boss Raid Titânicos
    '🐉 Escama do Dragão Lostvayne': 3500,
    '🗡️ Lâmina Quebrada Sagrada': 4000,
    '👑 Coroa do Rei Demônio': 5000,
    '🗡️ Espada da Escuridão': 4500,
    '🧬 Fragmento Mandamento': 3000,
    '✨ Asas do Arcanjo': 3500,
    '☀️ Centelha do Sol Cruel': 4000,
    '🛡️ Escudo da Graça': 4000,
    '🪽 Pluma Corrompida': 3000,
    '⚡ Raio da Punição Divina': 4500,
    '⭐ Cristal do Vazio': 2500,
    '🗡️ Lâmina Dimensional': 3000,
    '🛡️ Escudo Abissal': 3000,
    '👑 Coroa do Guardião': 3500,
    '🐉 Escama do Titã Ancestral': 3000
}

module.exports = {
    name: 'vender',
    aliases: ['sell'],
    category: 'economy',
    description: 'Vende todos os loots de monstros, dungeons e raids coletados para obter coins',
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
            const nomeItem = (typeof item === 'object' && item !== null) ? (item.nome || item.name) : String(item)
            if (nomeItem && precosLoot[nomeItem]) {
                total += precosLoot[nomeItem]
                vendidos.push(nomeItem)
                return false
            }
            return true
        })

        if (total <= 0) {
            return reply('❌ Você não possui loots de mobs, dungeons ou raids vendíveis no seu inventário.')
        }

        user.coins = (user.coins || 0) + total
        await dataService.saveXpData(xpData)
        logger.info('[VENDER] User ' + sender + ' vendeu ' + vendidos.length + ' loots por ' + total + ' coins')

        await reply('💰 *LOOTS VENDIDOS COM SUCESSO!*\n\n📦 *Itens vendidos:*\n' + vendidos.map(i => '• ' + i).join('\n') + '\n\n💵 *Total recebido:* +' + total.toLocaleString('pt-BR') + ' coins\n💰 *Saldo atual:* ' + (user.coins || 0).toLocaleString('pt-BR') + ' coins')
    }
}