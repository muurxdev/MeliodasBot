const dataService = require('../../services/dataService')
const { getCargo, getRank } = require('../../utils/helpers')
const ui = require('../../utils/ui')
const logger = require('../../core/logger')

module.exports = {
    name: 'ranking',
    aliases: ['top10'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Ranking global — top 10 por nível, coins ou mensagens',
    cooldownMs: 10000,
    execute: async ({ args, sender, reply }) => {
        const modo = (args[0] || '').toLowerCase()

        let titulo, ranking

        if (modo === 'coins') {
            titulo = '💰 TOP 10 POR COINS'
            ranking = dataService.userRepo.getTopCoins(10)
        } else if (modo === 'messages' || modo === 'mensagens') {
            titulo = '💬 TOP 10 POR MENSAGENS'
            ranking = dataService.userRepo.getTopRank(10)
            ranking = ranking.sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0)).slice(0, 10)
        } else {
            titulo = '👑 TOP 10 POR NÍVEL'
            ranking = dataService.userRepo.getTopRank(10)
        }

        if (!ranking || ranking.length === 0) {
            return reply('🏆 Nenhum jogador registrado no ranking ainda.')
        }

        let doc = ui.header(`${titulo}`)

        const mentions = []

        ranking.forEach(([jid, u], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            mentions.push(jid)
            const nome = u.name || u.displayNick || u.display_nick || '@' + jid.split('@')[0]

            if (modo === 'coins') {
                doc += `${medal} *#${i + 1}* ${nome}\n`
                doc += `💰 *${(u.coins || 0).toLocaleString('pt-BR')}* Coins | 📈 Nv. ${u.level || 1}\n\n`
            } else if (modo === 'messages' || modo === 'mensagens') {
                doc += `${medal} *#${i + 1}* ${nome}\n`
                doc += `💬 *${(u.messages || 0).toLocaleString('pt-BR')}* Mensagens | 📈 Nv. ${u.level || 1}\n\n`
            } else {
                doc += `${medal} *#${i + 1}* ${nome}\n`
                doc += `📈 *Nv. ${u.level || 1}* | ⭐ ${(u.xp || 0).toLocaleString('pt-BR')} XP\n`
                doc += `🎖️ ${getCargo(u.level || 1)}\n\n`
            }
        })

        doc += `💡 _Alternativas:_ \`.ranking coins\` | \`.ranking messages\`\n`
        doc += ui.footer()

        await reply(doc.trim(), mentions)
    }
}
