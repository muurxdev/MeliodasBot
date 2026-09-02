const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer } = require('../../services/rpgService')
const { arenas } = require('../../utils/constants')

module.exports = {
    name: 'arena',
    aliases: ['arenas', 'coliseu'],
    category: 'rpg',
    description: 'Lista todas as 20 arenas do bot e mostra sua arena atual',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        let textoArenas = '🏟️ *ARENAS DO MELIODAS BOT*\n\n'
        Object.entries(arenas).forEach(([num, a]) => {
            const atual = Number(num) === user.arenaAtual ? '👈 (Você está aqui)' : ''
            const status = (user.arenaPontos || 0) >= a.pontos ? '🟢' : '🔒'
            textoArenas += status + ' *Arena ' + num + ':* ' + a.nome + ' (' + a.pontos + ' troféus) ' + atual + '\n'
        })

        textoArenas += '\n🏆 *Seus Troféus:* ' + (user.arenaPontos || 0) + '\nUse *.batalhar* para desafiar a arena atual!'
        await reply(textoArenas)
    }
}