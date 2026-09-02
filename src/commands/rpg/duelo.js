/**
 * MeliodasBot — Comando .duelo / .pvp / .x1
 * Sistema completo de Duelo PvP 1v1 e 2v2 com cálculo de equipamentos, penalidades reais de moedas e marcação explícita
 */

const dataService = require('../../services/dataService')
const { initializeUser, processarLevelUp } = require('../../services/xpService')
const { calculateCharacterStats, getItem } = require('../../services/rpgEquipmentService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'duelo',
    aliases: ['pvp', 'x1', 'duel', 'combate1v1', 'lutar1v1'],
    category: 'rpg',
    description: 'Desafia jogadores para duelo PvP 1v1 ou 2v2 valendo moedas reais, XP e troféus',
    execute: async ({ info, sender, reply, args, text }) => {
        const botName = getBotName()
        const mencao = info.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

        if (!mencao || mencao.length === 0) {
            return reply(
                `╔══════════════════════════════╗\n` +
                `║      ⚔️ *ARENA DE DUELOS PVP* ⚔️     ║\n` +
                `╚══════════════════════════════╝\n\n` +
                `📌 *Como Desafiar:*\n` +
                `• \`.duelo @usuario\` ➔ Duelo 1v1 Valendo Moedas e XP\n` +
                `• \`.duelo @usuario <aposta>\` ➔ Duelo Apostado\n` +
                `• \`.duelo @aliado @op1 @op2\` ➔ Duelo em Dupla 2v2\n\n` +
                `💡 _Quem perder o duelo perde moedas da carteira para o vencedor!_\n` +
                `👑 *${botName}*`
            )
        }

        const xpData = dataService.getXpData()
        const userSender = initializeUser(sender, xpData)

        // ══════════════════════════════════════════
        // DUELO 1V1
        // ══════════════════════════════════════════
        if (mencao.length === 1) {
            const oponente = mencao[0]
            if (oponente === sender) {
                return reply('❌ Você não pode duelar contra si mesmo! Marque outro participante do grupo.')
            }

            const userOponente = initializeUser(oponente, xpData)

            // Argumento opcional de aposta customizada
            let customBet = 0
            const betArg = args.find(a => /^\d+$/.test(a))
            if (betArg) {
                customBet = parseInt(betArg, 10)
                if (customBet > (userSender.coins || 0)) {
                    return reply(`❌ Você não possui *${customBet.toLocaleString('pt-BR')} Coins* para apostar! (Seu saldo: ${(userSender.coins || 0).toLocaleString('pt-BR')} Coins)`)
                }
                if (customBet > (userOponente.coins || 0)) {
                    return reply(`❌ O oponente @${oponente.split('@')[0]} não possui moedas suficientes para essa aposta de *${customBet.toLocaleString('pt-BR')} Coins*!`, [oponente])
                }
            }

            // Estatísticas e Poder de Combate (CP) dos Lutadores
            const statsSender = calculateCharacterStats(userSender)
            const statsOponente = calculateCharacterStats(userOponente)

            const armaSenderRef = userSender.slots?.arma || userSender.arma
            const armaSender = armaSenderRef ? (typeof armaSenderRef === 'object' ? armaSenderRef.nome : (getItem(armaSenderRef)?.nome || userSender.arma)) : 'Punhos de Ferro'

            const armaOponenteRef = userOponente.slots?.arma || userOponente.arma
            const armaOponente = armaOponenteRef ? (typeof armaOponenteRef === 'object' ? armaOponenteRef.nome : (getItem(armaOponenteRef)?.nome || userOponente.arma)) : 'Punhos de Ferro'

            // Cálculo dinâmico de dano baseado em CP, Ataque, Crítico e Sorte
            let rollSender = statsSender.cp + (statsSender.atk * 2) + Math.floor(Math.random() * 80)
            let rollOponente = statsOponente.cp + (statsOponente.atk * 2) + Math.floor(Math.random() * 80)

            const critSender = Math.random() * 100 < statsSender.crit
            if (critSender) rollSender = Math.floor(rollSender * 1.5)

            const critOponente = Math.random() * 100 < statsOponente.crit
            if (critOponente) rollOponente = Math.floor(rollOponente * 1.5)

            // Redução por defesa e esquiva
            rollSender = Math.max(10, rollSender - Math.floor(statsOponente.def * 0.4))
            rollOponente = Math.max(10, rollOponente - Math.floor(statsSender.def * 0.4))

            const senderVenceu = rollSender >= rollOponente
            const vencedorJid = senderVenceu ? sender : oponente
            const perdedorJid = senderVenceu ? oponente : sender

            const userVencedor = senderVenceu ? userSender : userOponente
            const userPerdedor = senderVenceu ? userOponente : userSender

            // Cálculo das moedas: Se tiver aposta, usa a aposta; senão calcula perda proporcional justa (5% do saldo do perdedor + bônus de nível)
            let coinsTransferidas = customBet
            if (coinsTransferidas <= 0) {
                const baseLoss = Math.floor((userPerdedor.coins || 0) * 0.06) // 6% do saldo da carteira
                const minLoss = (userPerdedor.level || 1) * 35 + 50
                const maxLoss = 15000
                coinsTransferidas = Math.min(maxLoss, Math.max(minLoss, baseLoss))
                // Limita ao saldo do perdedor
                coinsTransferidas = Math.min(coinsTransferidas, userPerdedor.coins || 0)
                if (coinsTransferidas < 20) coinsTransferidas = 20
            }

            const xpGanho = (userPerdedor.level || 1) * 45 + Math.floor(Math.random() * 50) + 60
            const trofeusGanhos = Math.floor(Math.random() * 20) + 15
            const trofeusPerdidos = Math.floor(trofeusGanhos * 0.6)

            // Aplica transferências e estatísticas
            userVencedor.coins = (userVencedor.coins || 0) + coinsTransferidas
            userVencedor.xp = (userVencedor.xp || 0) + xpGanho
            userVencedor.wins = (userVencedor.wins || 0) + 1
            userVencedor.arenaPontos = (userVencedor.arenaPontos || 0) + trofeusGanhos

            userPerdedor.coins = Math.max(0, (userPerdedor.coins || 0) - coinsTransferidas)
            userPerdedor.losses = (userPerdedor.losses || 0) + 1
            userPerdedor.arenaPontos = Math.max(0, (userPerdedor.arenaPontos || 0) - trofeusPerdidos)

            // Verificação de Level Up no Vencedor
            const lvlResult = processarLevelUp(userVencedor)

            await dataService.saveXpData(xpData)
            logger.info(`[DUELO 1V1] ${sender} (${rollSender}) vs ${oponente} (${rollOponente}) -> Vencedor: ${vencedorJid} (+${coinsTransferidas} coins)`)

            const totalPartidasV = (userVencedor.wins || 0) + (userVencedor.losses || 0)
            const winrateV = totalPartidasV > 0 ? Math.round(((userVencedor.wins || 0) / totalPartidasV) * 100) : 100

            const totalPartidasP = (userPerdedor.wins || 0) + (userPerdedor.losses || 0)
            const winrateP = totalPartidasP > 0 ? Math.round(((userPerdedor.wins || 0) / totalPartidasP) * 100) : 0

            const nomeVencedor = userVencedor.nicknameRpg ? `*${userVencedor.nicknameRpg}*` : `@${vencedorJid.split('@')[0]}`
            const nomePerdedor = userPerdedor.nicknameRpg ? `*${userPerdedor.nicknameRpg}*` : `@${perdedorJid.split('@')[0]}`

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⚔️ *RESULTADO DO DUELO PVP 1V1* ⚔️  ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            doc += `🥊 @${sender.split('@')[0]} (⚡ ${statsSender.cp} CP)\n`
            doc += `   ⚔️ *Arma:* ${armaSender} ${critSender ? '💥 *(GOLPE CRÍTICO!)*' : ''}\n`
            doc += `   💥 *Dano Total Desferido:* *${rollSender.toLocaleString('pt-BR')}*\n\n`
            doc += `      *VS*\n\n`
            doc += `🥊 @${oponente.split('@')[0]} (⚡ ${statsOponente.cp} CP)\n`
            doc += `   ⚔️ *Arma:* ${armaOponente} ${critOponente ? '💥 *(GOLPE CRÍTICO!)*' : ''}\n`
            doc += `   💥 *Dano Total Desferido:* *${rollOponente.toLocaleString('pt-BR')}*\n\n`

            doc += `╭━〔 🏆 VENCEDOR DA BATALHA 〕━⬣\n`
            doc += `┃ 👑 *Campeão:* ${nomeVencedor} (@${vencedorJid.split('@')[0]})\n`
            doc += `┃ 💰 *Moedas Saqueadas:* *+${coinsTransferidas.toLocaleString('pt-BR')} Coins*\n`
            doc += `┃ ⭐ *Experiência:* *+${xpGanho.toLocaleString('pt-BR')} XP*\n`
            doc += `┃ 🏆 *Troféus de Arena:* *+${trofeusGanhos} Troféus*\n`
            doc += `┃ 📈 *Novo Saldo:* *${(userVencedor.coins || 0).toLocaleString('pt-BR')} Coins*\n`
            doc += `┃ 📊 *Cartel PvP:* ${userVencedor.wins}V / ${userVencedor.losses}D (${winrateV}% Winrate)\n`
            if (lvlResult.subiu) {
                doc += `┃ 🆙 *SUBIU DE NÍVEL!* *Nível ${userVencedor.level}* 🎉\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `╭━〔 💀 PERDEDOR DERROTADO 〕━⬣\n`
            doc += `┃ 🩸 *Derrotado:* ${nomePerdedor} (@${perdedorJid.split('@')[0]})\n`
            doc += `┃ 💸 *Moedas Perdidas:* *-${coinsTransferidas.toLocaleString('pt-BR')} Coins*\n`
            doc += `┃ 📉 *Troféus Perdidos:* *-${trofeusPerdidos} Troféus*\n`
            doc += `┃ 💰 *Saldo Restante:* *${(userPerdedor.coins || 0).toLocaleString('pt-BR')} Coins*\n`
            doc += `┃ 📊 *Cartel PvP:* ${userPerdedor.wins}V / ${userPerdedor.losses}D (${winrateP}% Winrate)\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

            doc += `💡 _Para revanche com aposta: \`.duelo @usuario <valor>\`_\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim(), [sender, oponente, vencedorJid, perdedorJid])
        }

        // ══════════════════════════════════════════
        // DUELO 2V2 EM DUPLAS
        // ══════════════════════════════════════════
        if (mencao.length === 3) {
            const jogador1 = sender
            const jogador2 = mencao[0]
            const jogador3 = mencao[1]
            const jogador4 = mencao[2]

            const jogadores = [jogador1, jogador2, jogador3, jogador4]
            if (new Set(jogadores).size !== 4) {
                return reply('❌ Para o duelo 2v2, todos os 4 guerreiros precisam ser participantes distintos.')
            }

            const p1 = initializeUser(jogador1, xpData)
            const p2 = initializeUser(jogador2, xpData)
            const p3 = initializeUser(jogador3, xpData)
            const p4 = initializeUser(jogador4, xpData)

            const s1 = calculateCharacterStats(p1)
            const s2 = calculateCharacterStats(p2)
            const s3 = calculateCharacterStats(p3)
            const s4 = calculateCharacterStats(p4)

            const poderT1 = s1.cp + s2.cp + (s1.atk + s2.atk) + Math.floor(Math.random() * 150)
            const poderT2 = s3.cp + s4.cp + (s3.atk + s4.atk) + Math.floor(Math.random() * 150)

            const t1Venceu = poderT1 >= poderT2
            const vencedores = t1Venceu ? [jogador1, jogador2] : [jogador3, jogador4]
            const perdedores = t1Venceu ? [jogador3, jogador4] : [jogador1, jogador2]

            const coinsPorVencedor = 200
            const coinsPorPerdedor = 100
            const xpPorVencedor = 150

            for (const j of vencedores) {
                const u = initializeUser(j, xpData)
                u.xp = (u.xp || 0) + xpPorVencedor
                u.coins = (u.coins || 0) + coinsPorVencedor
                u.wins = (u.wins || 0) + 1
                processarLevelUp(u)
            }

            for (const j of perdedores) {
                const u = initializeUser(j, xpData)
                u.coins = Math.max(0, (u.coins || 0) - coinsPorPerdedor)
                u.losses = (u.losses || 0) + 1
            }

            await dataService.saveXpData(xpData)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   ⚔️ *DUELO 2V2 — RESULTADO FINAL* ⚔️  ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `🛡️ *Time 1:* @${jogador1.split('@')[0]} & @${jogador2.split('@')[0]} ➔ *${poderT1.toLocaleString('pt-BR')} Poder*\n`
            doc += `🛡️ *Time 2:* @${jogador3.split('@')[0]} & @${jogador4.split('@')[0]} ➔ *${poderT2.toLocaleString('pt-BR')} Poder*\n\n`
            doc += `🏆 *DUPLA VENCEDORA:* @${vencedores[0].split('@')[0]} & @${vencedores[1].split('@')[0]}\n`
            doc += `💰 *Ganhos por Vencedor:* +${coinsPorVencedor} Coins | +${xpPorVencedor} XP\n\n`
            doc += `💀 *DUPLA DERROTADA:* @${perdedores[0].split('@')[0]} & @${perdedores[1].split('@')[0]}\n`
            doc += `💸 *Perdas por Perdedor:* -${coinsPorPerdedor} Coins\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim(), jogadores)
        }

        return reply('❌ Formato inválido! Use `.duelo @usuario` para 1v1 ou `.duelo @aliado @op1 @op2` para 2v2.')
    }
}