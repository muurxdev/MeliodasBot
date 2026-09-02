const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { pocoes } = require('../../utils/constants')

module.exports = {
    name: 'pocaoativa',
    aliases: ['buffs', 'minhapocao'],
    category: 'rpg',
    description: 'Consulta o tempo restante e efeitos da sua poção ativa',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.pocaoAtiva || Date.now() >= user.pocaoAtiva.expira) {
            user.pocaoAtiva = null
            await dataService.saveXpData(xpData)
            return reply('🧪 Você não tem nenhuma poção ativa no momento. Crie ou consuma uma com .pocao')
        }

        const pocao = pocoes[user.pocaoAtiva.tipo]
        const tempoRestante = user.pocaoAtiva.expira - Date.now()
        const minutos = Math.floor(tempoRestante / 60000)
        const segundos = Math.floor((tempoRestante % 60000) / 1000)

        await reply('🧪 *POÇÃO ATIVA:*\n\n' + (pocao?.nome || user.pocaoAtiva.tipo) + '\n✨ ' + (pocao?.descricao || '') + '\n⏱️ *Tempo restante:* ' + minutos + 'm ' + segundos + 's')
    }
}