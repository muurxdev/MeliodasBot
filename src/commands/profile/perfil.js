const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress } = require('../../services/xpService')
const { formatCoins, formatXP } = require('../../utils/uiEngine')
const { getCargo, getRank } = require('../../utils/helpers')
const logger = require('../../core/logger')
const { achievementsCatalog } = require('../../services/achievementEngine')

module.exports = {
    name: 'perfil',
    aliases: ['profile'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Perfil detalhado — nível, XP, coins, badge, conquistas e tempo no bot',
    cooldownMs: 5000,
    execute: async ({ args, sender, info, reply }) => {
        const alvo = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender

        const xpData = dataService.getXpData()
        const user = initializeUser(alvo, xpData)

        const level = user.level || 1
        const xpAtual = user.xp || 0
        const prog = getXpProgress(user)
        const cargo = getCargo(level)
        const rank = getRank(level)

        const conquistas = user.conquistas || []
        const badges = user.badges || []
        const equippedBadge = user.equippedBadge || null

        const tempoRegistro = user.registeredAt || user.registered_at || null
        let tempoNoBot = 'Desconhecido'
        if (tempoRegistro) {
            const desde = new Date(tempoRegistro)
            const agora = new Date()
            const diffMs = agora - desde
            const dias = Math.floor(diffMs / 86400000)
            if (dias > 0) {
                tempoNoBot = dias + ' dias'
            } else {
                const horas = Math.floor(diffMs / 3600000)
                tempoNoBot = horas > 0 ? horas + ' horas' : 'Menos de 1 hora'
            }
        }

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        doc += `┃   👤 *PERFIL COMPLETO* 👤   \n`
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`

        doc += `👤 @${alvo.split('@')[0]}\n`
        if (user.name || user.displayNick) {
            doc += `📛 *Nome:* ${user.name || user.displayNick}\n`
        }

        doc += `\n╭━━━〔 📊 ESTATÍSTICAS 〕━━━┈⊷\n`
        doc += `┃ 📈 *Nível:* ${level} | 🏆 *Rank:* ${rank}\n`
        doc += `┃ 💼 *Cargo:* ${cargo}\n`
        doc += `┃ ⭐ *XP:* ${xpAtual.toLocaleString('pt-BR')} / ${prog.necessario.toLocaleString('pt-BR')}\n`
        doc += `┃ ${prog.barra} ${prog.percent}%\n`
        doc += `┃ 💰 *Coins:* ${user.coins.toLocaleString('pt-BR')}\n`
        doc += `┃ 💬 *Mensagens:* ${(user.messages || 0).toLocaleString('pt-BR')}\n`
        doc += `┃ ❤️ *HP:* ${user.hp || user.hpMax || 100}/${user.hpMax || 100}\n`
        doc += `┃ ⚔️ *ATK:* ${user.atk || 10} | 🛡️ *DEF:* ${user.def || 5}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`

        if (equippedBadge) {
            const badgeInfo = require('./badges')
            const badge = (badgeInfo?.BADGES_CATALOGO || []).find(b => b.id === equippedBadge)
            doc += `🏅 *Badge Equipada:* ${badge ? badge.nome : equippedBadge}\n\n`
        }

        if (conquistas.length > 0) {
            doc += `╭━━━〔 🏆 CONQUISTAS (${conquistas.length}) 〕━━━┈⊷\n`
            for (const cid of conquistas) {
                const ach = achievementsCatalog.find(a => a.id === cid)
                doc += `┃ ✅ ${ach ? ach.titulo : cid}\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`
        }

        if (badges.length > 0) {
            doc += `╭━━━〔 🏅 BADGES (${badges.length}) 〕━━━┈⊷\n`
            for (const bid of badges) {
                doc += `┃ 🏅 ${bid}\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`
        }

        if (user.equipment) {
            const eq = user.equipment
            const itens = [eq.weapon, eq.armor, eq.cape, eq.ring, eq.amulet].filter(Boolean)
            if (itens.length > 0) {
                doc += `╭━━━〔 🛡️ EQUIPAMENTO 〕━━━┈⊷\n`
                if (eq.weapon) doc += `┃ ⚔️ ${eq.weapon}\n`
                if (eq.armor) doc += `┃ 🛡️ ${eq.armor}\n`
                if (eq.cape) doc += `� 🧥 ${eq.cape}\n`
                if (eq.ring) doc += `┃ 💍 ${eq.ring}\n`
                if (eq.amulet) doc += `┃ 📿 ${eq.amulet}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`
            }
        }

        doc += `╭━━━〔 ⏱️ TEMPO NO BOT 〕━━━┈⊷\n`
        doc += `┃ 📅 *Membro há:* ${tempoNoBot}\n`
        doc += `┃ 🔥 *Streak:* ${user.streak || 0} dias\n`
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n`

        await reply(doc.trim(), [alvo])
    }
}
