const dataService = require('../../services/dataService')
const { initializeUser, getXpProgress, getMissoesRecomendadas } = require('../../services/xpService')
const { formatCoins, formatXP } = require('../../utils/uiEngine')
const { getCargo, getRank } = require('../../utils/helpers')
const logger = require('../../core/logger')
const { achievementsCatalog } = require('../../services/achievementEngine')
const { resolveHp, calculateFullCharacterStats } = require('../../services/characterEngine')
const { getItem } = require('../../services/rpgEquipmentService')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: 'perfil',
    aliases: ['profile', 'meustatus', 'statusrpg'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Perfil detalhado — nível, XP, separação de farms (Grupo, PV, RPG), equipamentos, forja e missões para upar',
    cooldownMs: 3000,
    execute: async ({ args, sender, senderReal, info, reply, prefix = '.' }) => {
        const botName = getBotName()
        const targetClean = (args && args[0]) ? args[0].replace(/[@\s]/g, '').replace(/\D/g, '') : ''
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant
        const alvo = mentioned || quotedParticipant || (targetClean ? (targetClean + '@s.whatsapp.net') : (senderReal || sender))

        const candidateJids = [alvo, sender, senderReal].filter(Boolean)
        const xpData = dataService.getXpData()
        const user = initializeUser(alvo, xpData, candidateJids)

        const level = Number(user.level || 1)
        const xpAtual = Number(user.xp || 0)
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

        const stats = calculateFullCharacterStats(user)
        const _hp = resolveHp(user)

        // Resolução do Nome/Nick do Jogador
        const nomeRegistrado = user.displayNick || user.nicknameRpg || user.name || null

        // Dados de Armas e Forja
        const armaRef = user.slots?.arma || user.arma || user.equipado
        const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || "Espada de Ferro")) : "Punhos de Ferro"
        const forgeSufixo = user.forgeLevel > 0 ? ` +${user.forgeLevel}` : ""

        // Farms Separados
        const farmGrupoMsgs = Number(user.messagesGroup || 0)
        const farmPvMsgs = Number(user.messagesPv || 0)
        const farmGrupoXp = Number(user.xpGroup || 0)
        const farmPvXp = Number(user.xpPv || 0)
        const farmGrupoCoins = Number(user.coinsGroup || 0)
        const farmPvCoins = Number(user.coinsPv || 0)
        const farmRpgXp = Number(user.xpRpg || user.xp_rpg || 0)
        const totalMsgs = (farmGrupoMsgs + farmPvMsgs) || Number(user.messages || 0)

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   👤 *PERFIL DE AVENTUREIRO* 👤   \n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `👤 @${alvo.split('@')[0]}\n`
        if (nomeRegistrado) {
            doc += `🏷️ *Guerreiro / Nick:* ${nomeRegistrado}\n`
        }

        doc += `\n╭━〔 ⚔️ STATUS & ATRIBUTOS RPG 〕━⬣\n`
        doc += `┃ 📈 *Nível:* ${level} | 🏆 *Rank:* ${rank}\n`
        doc += `┃ 🎖️ *Patente:* ${cargo}\n`
        doc += `┃ ⚡ *Poder Total (CP):* ${stats.cp.toLocaleString('pt-BR')} CP\n`
        doc += `┃ ❤️ *HP:* ${_hp.atual.toLocaleString('pt-BR')} / ${_hp.max.toLocaleString('pt-BR')} ${_hp.barra}\n`
        doc += `┃ ⚔️ *ATK Total:* ${stats.atk.toLocaleString('pt-BR')} | 🛡️ *DEF:* ${stats.def.toLocaleString('pt-BR')}\n`
        doc += `┃ 🗡️ *Arma Ativa:* ${armaNome}${forgeSufixo}\n`
        doc += `┃ 🔨 *Nível da Forja:* +${user.forgeLevel || 0}\n`
        doc += `┃ 🌍 *Mundo Atual:* ${user.mundo || 'floresta'}\n`
        doc += `┃ 🏰 *Masmorra:* Andar ${user.dungeonFloor || 1} (Recorde: ${user.dungeonRecorde || 0})\n`
        if (stats.rebirths > 0) {
            doc += `┃ 🌀 *Rebirth Ativo:* ${stats.rebirths}º Renascimento (+${stats.rebirths * 25}% Dano & XP Perpétuo)\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🎯 PROGRESSÃO P/ NÍVEL ${level + 1} 〕━⬣\n`
        doc += `┃ ⭐ *XP Atual:* ${xpAtual.toLocaleString('pt-BR')} / ${prog.necessario.toLocaleString('pt-BR')} XP\n`
        doc += `┃ 📊 ${prog.barra} ${prog.percent}%\n`
        doc += `┃ ⏳ *Faltam:* ${prog.faltam.toLocaleString('pt-BR')} XP para o Nível ${level + 1}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 🌾 DIVISÃO DE FARMS DO USUÁRIO 〕━⬣\n`
        doc += `┃ 💬 *Farm no Grupo:* ${farmGrupoMsgs.toLocaleString('pt-BR')} msgs | ⭐ ${farmGrupoXp.toLocaleString('pt-BR')} XP${farmGrupoCoins > 0 ? ` | 🪙 ${farmGrupoCoins.toLocaleString('pt-BR')} Coins` : ''}\n`
        doc += `┃ 🔒 *Farm no Privado:* ${farmPvMsgs.toLocaleString('pt-BR')} msgs | ⭐ ${farmPvXp.toLocaleString('pt-BR')} XP${farmPvCoins > 0 ? ` | 🪙 ${farmPvCoins.toLocaleString('pt-BR')} Coins` : ''}\n`
        doc += `┃ ⚔️ *Farm no RPG:* ⭐ ${farmRpgXp.toLocaleString('pt-BR')} XP de combate\n`
        doc += `┃ 📊 *Histórico Batalhas:* 🗡️ ${(user.wins || 0).toLocaleString('pt-BR')} Vitórias | 💀 ${(user.bossesMortos || 0).toLocaleString('pt-BR')} Bosses\n`
        doc += `┃ 🌟 *Total de Mensagens:* ${totalMsgs.toLocaleString('pt-BR')} mensagens\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        // Missões Recomendadas para Upar
        const missoesUpar = getMissoesRecomendadas(user, prefix)
        doc += `╭━〔 📜 O QUE FAZER PARA UPAR RÁPIDO 〕━⬣\n`
        missoesUpar.slice(0, 4).forEach(m => {
            doc += `┃ ${m}\n`
        })
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 💰 PATRIMÔNIO & FINANÇAS 〕━⬣\n`
        doc += `┃ 💵 *Carteira:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`
        doc += `┃ 🏦 *Banco Seguro:* ${(user.bank || user.banco || 0).toLocaleString('pt-BR')} Coins\n`
        doc += `┃ 💎 *Total:* ${((user.coins || 0) + (user.bank || user.banco || 0)).toLocaleString('pt-BR')} Coins\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        if (equippedBadge) {
            const badgeInfo = require('./badges')
            const badge = (badgeInfo?.BADGES_CATALOGO || []).find(b => b.id === equippedBadge)
            doc += `🏅 *Badge Equipada:* ${badge ? badge.nome : equippedBadge}\n\n`
        }

        if (conquistas.length > 0) {
            doc += `╭━〔 🏆 CONQUISTAS (${conquistas.length}) 〕━⬣\n`
            for (const cid of conquistas.slice(0, 6)) {
                const ach = achievementsCatalog.find(a => a.id === cid)
                doc += `┃ ✅ ${ach ? ach.titulo : cid}\n`
            }
            if (conquistas.length > 6) doc += `┃ _...e mais ${conquistas.length - 6} conquistas_\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        }

        doc += `╭━〔 ⏱️ TEMPO NO BOT 〕━⬣\n`
        doc += `┃ 📅 *Membro há:* ${tempoNoBot}\n`
        doc += `┃ 🔥 *Streak:* ${user.streak || 0} dias\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `👑 *${botName}*`

        await reply(doc.trim(), [alvo])
    }
}
