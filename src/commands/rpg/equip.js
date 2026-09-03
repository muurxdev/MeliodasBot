const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

const itensAtalho = {
    '1': 'VIP DEV',
    '2': 'React Master',
    '3': 'Node Wizard',
    '4': 'Full Stack'
}

module.exports = {
    name: 'equip',
    aliases: ['use'],
    category: 'rpg',
    description: 'Equipa um item ou equipamento forjado do seu inventário',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('❌ Digite o nome ou número do item que deseja equipar. Exemplo: .equip VIP DEV ou .equip ⚔️ Espada de Bug')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const inventario = user.inventario || []

        if (inventario.length === 0) {
            return reply('📦 Seu inventário está vazio.')
        }

        const termo = text.trim()
        const itemEscolhido = itensAtalho[termo] || inventario.find(i => i.toLowerCase().includes(termo.toLowerCase())) || termo

        if (!inventario.includes(itemEscolhido)) {
            return reply('❌ Você não possui o item "' + termo + '" no seu inventário. Use *.inv* para ver seus itens.')
        }

        user.equipado = itemEscolhido

        if (itemEscolhido === '⚔️ Espada de Bug') {
            user.arma = 'espada_bug'
        }

        await dataService.saveXpData(xpData)
        logger.info('[EQUIP] User ' + sender + ' equipou ' + itemEscolhido)

        await reply('✅ *Item equipado com sucesso!*\n\n🎖️ *Equipado:* ' + itemEscolhido)
    }
}