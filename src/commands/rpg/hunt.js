const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { sortearLootMob } = require('../../services/rpgService')
const { mundos } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'hunt',
    aliases: ['cacar', 'caçar'],
    category: 'rpg',
    description: 'Caça monstros no mundo atual para ganhar XP, coins e loots',
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const mundoAtual = mundos[user.mundo || 'floresta']

        if (user.level < mundoAtual.minLevel) {
            return reply('❌ Nível insuficiente para caçar neste mundo.\n\n🌍 Mundo: ' + mundoAtual.nome + '\n📊 Seu nível: ' + user.level + '\n🔓 Nível necessário: ' + mundoAtual.minLevel)
        }

        const monstro = mundoAtual.monstros[Math.floor(Math.random() * mundoAtual.monstros.length)]

        const { calcularDanoPlayer } = require('../../services/combatEngine')
        const combat = calcularDanoPlayer(user, monstro)

        const poderJogador = (user.level * 35) + combat.danoFinal + Math.floor(Math.random() * 80) + 120
        const poderMonstro = Math.floor(monstro.hp / 20) + monstro.dano + Math.floor(Math.random() * 40)

        if (poderJogador >= poderMonstro) {
            user.xp = (user.xp || 0) + monstro.xp
            user.coins = (user.coins || 0) + monstro.coins
            user.wins = (user.wins || 0) + 1

            if (!user.inventario) user.inventario = []

            let lootMob = sortearLootMob(monstro.loot)
            if (lootMob) {
                if (user.inventario.length >= (user.mochila || 20)) {
                    lootMob = null
                } else {
                    user.inventario.push(lootMob)
                }
            }

            dataService.saveUser(user)
            logger.info('[HUNT] User ' + sender + ' venceu ' + monstro.nome)

            let critText = combat.isCritico ? ' 💥 *ACERTO CRÍTICO!*' : (combat.isDobro ? ' ⚡ *DANO DUPLO!*' : '')

            return reply('🗺️ *CAÇADA — VITÓRIA!*' + critText + '\n\n🌍 *Mundo:* ' + mundoAtual.nome + '\n👤 @' + sender.split('@')[0] + ' *VS* ' + monstro.nome + '\n⚔️ *Dano Total:* ' + combat.danoFinal + '\n\n⭐ *+' + monstro.xp + ' XP*\n💰 *+' + monstro.coins + ' Coins*\n🎁 *Loot:* ' + (lootMob || 'Nenhum'), [sender])
        }

        const perdaCoins = Math.min(user.coins || 0, 20)
        user.coins = Math.max(0, (user.coins || 0) - perdaCoins)
        user.losses = (user.losses || 0) + 1

        dataService.saveUser(user)
        logger.info('[HUNT] User ' + sender + ' foi derrotado por ' + monstro.nome)

        return reply('🗺️ *CAÇADA — DERROTA!*\n\n🌍 *Mundo:* ' + mundoAtual.nome + '\n👤 @' + sender.split('@')[0] + ' *VS* ' + monstro.nome + '\n\n💀 *Você foi surpreendido pelo monstro!*\n💰 *-' + perdaCoins + ' coins*', [sender])
    }
}