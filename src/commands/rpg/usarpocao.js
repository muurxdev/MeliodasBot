const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'usarpocao',
    aliases: ['tomarpocao', 'beberpocao', 'usepot'],
    category: 'rpg',
    description: 'Consome uma poção do inventário ativando seus buffs por 30 minutos',
    execute: async ({ text, sender, reply }) => {
        if (!text) return reply('🧪 *USE:* .usarpocao [tipo]\n\n• .usarpocao forca\n• .usarpocao experiencia\n• .usarpocao fortuna\n• .usarpocao lendaria')

        const tipo = text.toLowerCase().trim()
        if (!pocoes[tipo]) return reply('❌ Poção inexistente. Use: forca, experiencia, fortuna ou lendaria.')

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        if (!user.inventario) user.inventario = []

        const nomePocao = '🧪 ' + tipo
        const index = user.inventario.indexOf(nomePocao)

        if (index === -1) {
            return reply('❌ Você não possui *' + pocoes[tipo].nome + '* no inventário. Crie uma com *.criarpocao ' + tipo + '*')
        }

        user.inventario.splice(index, 1)
        user.pocaoAtiva = {
            tipo: tipo,
            expira: Date.now() + pocoes[tipo].duracao
        }

        await dataService.saveXpData(xpData)
        logger.info('[USARPOCAO] User ' + sender + ' consumiu poção ' + tipo)

        await reply('🧪 *POÇÃO ATIVADA COM SUCESSO!*\n\n' + pocoes[tipo].nome + '\n✨ ' + pocoes[tipo].descricao + '\n⏳ *Duração:* 30 minutos\n\n🔥 O efeito será aplicado em Bosses, Caçadas, Duelos e Arenas!')
    }
}