const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes, receitasPocao } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'criarpocao',
    aliases: ['fazerpocao', 'brew'],
    category: 'rpg',
    description: 'Cria uma poção consumindo os loots necessários do inventário',
    execute: async ({ text, sender, reply }) => {
        if (!text) {
            return reply('⚗️ *COMO CRIAR POÇÕES:*\n\n• .criarpocao forca\n• .criarpocao experiencia\n• .criarpocao fortuna\n• .criarpocao lendaria')
        }

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo] || !receitasPocao[tipo]) {
            return reply('❌ Poção inválida. Escolha entre: forca, experiencia, fortuna ou lendaria.')
        }

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const receita = receitasPocao[tipo]

        for (const [item, quantidade] of Object.entries(receita)) {
            const possui = user.inventario.filter(i => i === item).length
            if (possui < quantidade) {
                return reply('❌ *MATERIAIS INSUFICIENTES!*\n\n🧪 *' + pocoes[tipo].nome + '*\n\n*Receita necessária:*\n' + Object.entries(receita).map(([i, q]) => '• ' + q + 'x ' + i).join('\n') + '\n\n❌ *Faltando:* ' + item + ' (' + possui + '/' + quantidade + ')')
            }
        }

        for (const [item, quantidade] of Object.entries(receita)) {
            for (let i = 0; i < quantidade; i++) {
                const index = user.inventario.indexOf(item)
                if (index !== -1) {
                    user.inventario.splice(index, 1)
                }
            }
        }

        user.inventario.push('🧪 ' + tipo)
        await dataService.saveXpData(xpData)
        logger.info('[CRIARPOCAO] User ' + sender + ' criou poção ' + tipo)

        await reply('⚗️ *POÇÃO CRIADA COM SUCESSO!*\n\n' + pocoes[tipo].nome + '\n✅ Adicionada ao seu inventário: *🧪 1x ' + tipo + '*\n\nUse para consumir:\n*.usarpocao ' + tipo + '*')
    }
}