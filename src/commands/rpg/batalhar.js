const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { atualizarArenaPlayer, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { arenas, cartasArena } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'batalhar',
    aliases: ['lutararena', 'arenabattle'],
    category: 'rpg',
    description: 'Batalha na sua arena atual contra guardiões para ganhar troféus e coins',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        atualizarArenaPlayer(user)

        const arenaJogador = arenas[user.arenaAtual]
        if (!arenaJogador) {
            return reply('❌ Arena inválida. Use .arena para listar.')
        }

        const cartasDaArena = cartasArena[user.arenaAtual] || ['Guardião da Arena']
        const inimigo = cartasDaArena[Math.floor(Math.random() * cartasDaArena.length)]

        let poderPlayerBase = (user.level * 20) + Math.floor(Math.random() * 150)
        let poderPlayer = aplicarBonusDano(user, poderPlayerBase)

        const poderArena = Math.floor(arenaJogador.pontos / 20) + Math.floor(Math.random() * 200) + 50

        if (poderPlayer >= poderArena) {
            const ganhoTrofeus = Math.floor(Math.random() * 35) + 15
            const ganhoCoins = aplicarBonusCoins(user, 50)

            user.arenaPontos = (user.arenaPontos || 0) + ganhoTrofeus
            user.coins = (user.coins || 0) + ganhoCoins
            atualizarArenaPlayer(user)

            await dataService.saveXpData(xpData)
            logger.info('[BATALHAR] User ' + sender + ' venceu arena ' + user.arenaAtual + ' (+' + ganhoTrofeus + ' troféus)')

            return reply('🏆 *BATALHA DE ARENA — VITÓRIA!*\n\n👤 @' + sender.split('@')[0] + ' *VS* ⚔️ ' + inimigo + '\n\n💥 *Seu Poder:* ' + poderPlayer + '\n💀 *Poder do Guardião:* ' + poderArena + '\n\n✅ *Você venceu o combate!*\n🏆 *+' + ganhoTrofeus + ' Troféus de Arena*\n💰 *+' + ganhoCoins + ' Coins*\n\n🏟️ *Arena Atual:* ' + arenaJogador.nome + '\n🏅 *Total de Troféus:* ' + user.arenaPontos, [sender])
        }

        const perdaTrofeus = Math.floor(Math.random() * 20) + 5
        user.arenaPontos = Math.max(0, (user.arenaPontos || 0) - perdaTrofeus)
        atualizarArenaPlayer(user)

        await dataService.saveXpData(xpData)
        logger.info('[BATALHAR] User ' + sender + ' perdeu na arena (-' + perdaTrofeus + ' troféus)')

        return reply('💀 *BATALHA DE ARENA — DERROTA!*\n\n👤 @' + sender.split('@')[0] + ' *VS* ⚔️ ' + inimigo + '\n\n💥 *Seu Poder:* ' + poderPlayer + '\n💀 *Poder do Guardião:* ' + poderArena + '\n\n❌ *Você foi derrotado!*\n🏆 *-' + perdaTrofeus + ' Troféus de Arena*\n\n🏟️ *Arena Atual:* ' + arenaJogador.nome + '\n🏅 *Total de Troféus:* ' + user.arenaPontos, [sender])
    }
}