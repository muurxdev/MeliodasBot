const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { mundos } = require('../../utils/constants')

module.exports = {
    name: 'mundo',
    aliases: ['mundos', 'mapa'],
    category: 'rpg',
    description: 'Lista os mundos disponíveis e seus requisitos de nível',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        let textoMundos = '🌍 *MUNDOS DISPONÍVEIS*\n\n'
        Object.entries(mundos).forEach(([id, m]) => {
            const status = user.level >= m.minLevel ? '🟢 Desbloqueado' : ('🔒 Nível ' + m.minLevel)
            const atual = (user.mundo || 'floresta') === id ? '👈 (Atual)' : ''
            textoMundos += '📌 *' + m.nome + '* (' + id + ') ' + atual + '\n📊 Status: ' + status + '\n\n'
        })

        textoMundos += 'Para viajar use: .viajar [nome_do_mundo]'
        await reply(textoMundos)
    }
}