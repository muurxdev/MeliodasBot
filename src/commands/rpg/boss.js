const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { gerarBoss, sortearLootBoss, aplicarBonusDano, aplicarBonusCoins } = require('../../services/rpgService')
const { bosses, mundos, petsDisponiveis } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'boss',
    aliases: ['chefe'],
    category: 'rpg',
    description: 'Sistema completo de Bosses: criar, atacar, ajudar e consultar recompensas',
    execute: async ({ text, args, from, sender, info, reply }) => {
        const subCmd = args[0] ? args[0].toLowerCase() : ''
        const param = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const bossData = dataService.getBossData()
        const missoesData = dataService.getMissoesData()

        if (subCmd === 'lista' || subCmd === 'bosses' || subCmd === 'list') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            let lista = `╔══════════════════════════════╗\n`
            lista += `║    🐉 *CATÁLOGO DE BOSSES* 🐉    ║\n`
            lista += `╚══════════════════════════════╝\n\n`
            lista += `👤 *Jogador:* @${sender.split('@')[0]}\n`
            lista += `🌍 *Seu Mundo Atual:* *${mundoAtualBoss.nome}*\n`
            lista += `🐉 *Bosses Eliminados:* *${user.bossesMortos || 0} chefes*\n\n`
            lista += `╭━〔 ⚔️ BOSSES DO SEU MUNDO 〕━⬣\n`
            mundoAtualBoss.bosses.forEach(bId => {
                const b = bosses[bId]
                if (b) {
                    lista += `┃ 👑 *${b.nome}* (\`${bId}\`)\n`
                    lista += `┃ ❤️ Vida: ${b.vidaBase.toLocaleString('pt-BR')} HP | ✨ Efeito: ${b.efeito}\n`
                    lista += `┃ 📦 Drops: ${b.loot?.map(l => l.nome).join(', ') || 'Nenhum'}\n`
                    lista += `┃ 💡 Invocar: \`.boss criar ${bId}\`\n`
                    lista += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                }
            })
            lista += `╭━〔 🌌 TODOS OS BOSSES DO REINO 〕━⬣\n`
            Object.entries(bosses).forEach(([id, b]) => {
                lista += `┃ • *${b.nome}* (\`${id}\`) — ${b.vidaBase.toLocaleString('pt-BR')} HP\n`
            })
            lista += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            lista += `💡 _Para invocar um boss:_ \`.boss criar [id]\`\n`
            lista += `💡 _Para ver tabela detalhada de drops:_ \`.boss loot\``
            return reply(lista.trim(), [sender])
        }

        if (subCmd === 'loot' || subCmd === 'loots') {
            let listaLoots = '🐉 *TABELA DE LOOTS DE BOSSES*\n\n'
            Object.entries(bosses).forEach(([id, b]) => {
                listaLoots += '🧬 *' + b.nome + ':*\n'
                b.loot.forEach(l => {
                    listaLoots += '• ' + l.nome + ' - ' + l.chance + '%\n'
                })
                listaLoots += '\n'
            })
            return reply(listaLoots)
        }

        let donoBoss = sender
        if (subCmd === 'ajudar' || subCmd === 'ajd') {
            const marcado = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            if (!marcado) {
                return reply('❌ Marque quem você deseja ajudar no Boss. Exemplo: .boss ajudar @usuario')
            }
            donoBoss = marcado
        }

        const idLuta = from + '_' + donoBoss

        if (subCmd === 'criar') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            const bossEscolhido = param || mundoAtualBoss.bosses[0]

            if (!mundoAtualBoss.bosses.includes(bossEscolhido)) {
                return reply('🚫 *Boss Bloqueado!*\n\n🐉 Boss: ' + bossEscolhido + '\n🌍 Seu mundo atual: ' + mundoAtualBoss.nome + '\n❌ Este boss não pertence ao seu mundo atual.')
            }

            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply('❌ Você já possui um Boss ativo nesta sala!\n\nUse: .boss atk ou .atk')
            }

            bossData.lutas[idLuta] = gerarBoss(bossEscolhido)
            bossData.lutas[idLuta].dono = donoBoss

            await dataService.saveBossData(bossData)
            logger.info('[BOSS CRIAR] User ' + sender + ' invocou boss ' + bossData.lutas[idLuta].nome)

            return reply('🐉 *BOSS INVOCADO COM SUCESSO!*\n\n👑 *Invocador:* @' + sender.split('@')[0] + '\n🧬 *Boss:* ' + bossData.lutas[idLuta].nome + '\n✨ *Raridade:* ' + bossData.lutas[idLuta].raridade + '\n❤️ *Vida:* ' + bossData.lutas[idLuta].vida + ' / ' + bossData.lutas[idLuta].vidaMax + '\n\nUse *.boss atk* ou *.atk* para atacar!', [sender])
        }

        if (subCmd === 'atk' || subCmd === 'atacar' || subCmd === 'ajudar' || subCmd === 'ajd') {
            const bossEntry = bossData.lutas[idLuta]
            if (!bossEntry || !bossEntry.ativo || bossEntry.vida <= 0) {
                delete bossData.lutas[idLuta]
                await dataService.saveBossData(bossData)
                return reply('❌ Nenhum Boss ativo encontrado para lutar.\n\nUse: .boss criar bug')
            }

            const boss = bossEntry
            const { calcularDanoPlayer, calcularDanoSofrido } = require('../../services/combatEngine')
            const { calculateFullCharacterStats } = require('../../services/characterEngine')
            const { getItem } = require('../../services/rpgEquipmentService')
            const stats = calculateFullCharacterStats(user)

            const combatResult = calcularDanoPlayer(user, boss)
            const dano = combatResult.danoFinal

            const armaRef = user.slots?.arma || user.arma
            const armaObj = armaRef ? (typeof armaRef === 'object' ? armaRef : getItem(armaRef)) : null
            const armaNome = armaObj ? armaObj.nome : (user.arma || 'Punhos Desarmados')
            const armaAtk = armaObj ? armaObj.atk : 0

            const procs = []
            if (armaAtk > 0) {
                procs.push(`🗡️ ${armaNome} (+${armaAtk} ATK)`)
            }
            if (combatResult.isCritico) {
                procs.push(`⚡ Acerto Crítico (${stats.crit}%)`)
            }
            if (combatResult.isDobro) {
                procs.push(`🔥 Golpe Duplo`)
            }

            if (missoesData[sender]?.missao?.tipo === 'boss' && !missoesData[sender].concluida) {
                missoesData[sender].progresso += 1
                await dataService.saveMissoesData(missoesData)
            }

            const danoBossRaw = Math.floor(Math.random() * 35) + 15
            const sofridoResult = calcularDanoSofrido(user, danoBossRaw)
            const danoBoss = sofridoResult.danoMitigado

            if (sofridoResult.esquivou) {
                procs.push(`💨 Esquivou do contra-ataque do Boss!`)
            } else if (sofridoResult.bloqueou) {
                procs.push(`🛡️ Bloqueou 50% do impacto do Boss!`)
            }

            user.hp = Math.max(0, (user.hp || stats.hpMax) - (sofridoResult.esquivou ? 0 : danoBoss))

            if (user.hp <= 0) {
                user.hp = stats.hpMax
                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)

                return reply('💀 *VOCÊ MORREU NO COMBATE!*\n\n🐉 O Boss desferiu um ataque de ' + danoBoss + ' de dano.\n❤️ Seu HP foi restaurado para ' + user.hp + '/' + stats.hpMax + '.\n⚠️ Você não conseguiu causar dano no Boss nesta rodada.')
            }

            boss.vida -= dano
            if (!boss.dano[sender]) boss.dano[sender] = 0
            boss.dano[sender] += dano

            const percentDamageDealt = ((dano / boss.vidaMax) * 100).toFixed(1)
            const remainingBossPercent = Math.max(0, Math.min(100, Math.round((Math.max(0, boss.vida) / boss.vidaMax) * 100)))

            function makeHpBar(pct) {
                const totalBlocks = 10
                const filled = Math.round((pct / 100) * totalBlocks)
                const empty = totalBlocks - filled
                return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty))
            }

            if (boss.vida <= 0) {
                boss.vida = 0
                boss.ativo = false
                delete bossData.lutas[idLuta]

                const { processarLevelUp } = require('../../services/xpService')
                const participantes = Object.keys(boss.dano)
                const mult = boss.multiplicador || 1
                let relatorioRecompensas = '🏆 *BOSS DERROTADO COM SUCESSO!*\n\n👑 *' + boss.nome + '* (' + boss.raridade + ') foi eliminado!\n\n🎁 *RECOMPENSAS DISTRIBUÍDAS:*\n'

                participantes.forEach(pUser => {
                    const perfilP = initializeUser(pUser, xpData)
                    perfilP.bossesMortos = (perfilP.bossesMortos || 0) + 1

                    const danoP = boss.dano[pUser]
                    // Alem do contador, guarda QUAL boss caiu: o perfil mostrava
                    // "37 bosses" sem dizer quais eram.
                    require('../../services/bossHistoryService')
                        .registrarAbate(perfilP, boss, { dano: danoP, tipo: 'boss' })
                    const xpGanho = Math.floor((100 + danoP / 5) * mult)
                    const coinsGanho = Math.floor((200 + danoP / 3) * mult)

                    perfilP.xp = (perfilP.xp || 0) + xpGanho
                    perfilP.coins = (perfilP.coins || 0) + coinsGanho

                    const lvlResult = processarLevelUp(perfilP)

                    relatorioRecompensas += '\n👤 @' + pUser.split('@')[0] + ':\n'
                    relatorioRecompensas += '⚔️ Dano Total: ' + danoP.toLocaleString('pt-BR') + ' (' + Math.round((danoP / boss.vidaMax) * 100) + '% do Chefe)\n'
                    relatorioRecompensas += '⭐ +' + xpGanho.toLocaleString('pt-BR') + ' XP | 💰 +' + coinsGanho.toLocaleString('pt-BR') + ' Coins\n'
                    if (lvlResult.subiu) {
                        relatorioRecompensas += '🆙 *SUBIU DE NÍVEL!* Nível ' + perfilP.level + ' (+HP / +Coins)\n'
                    }

                    let lootRecebido = null
                    if (boss.loot && boss.loot.length > 0) {
                        const chanceLoot = Math.random() * 100
                        let chanceAcumulada = 0
                        for (const l of boss.loot) {
                            chanceAcumulada += l.chance
                            if (chanceLoot < chanceAcumulada) {
                                lootRecebido = l.nome
                                if (!perfilP.inventario) perfilP.inventario = []
                                perfilP.inventario.push(l.nome)
                                break
                            }
                        }
                    }

                    if (lootRecebido) {
                        relatorioRecompensas += '🎁 *Drop Raro Obtido:* ' + lootRecebido + '!\n'
                    }

                    // Equipamento REAL do catálogo. A tabela `boss.loot` acima só
                    // devolve nomes soltos (strings), que não viram equipamento.
                    // Boss é o conteúdo mais difícil, então a chance é alta (35%).
                    try {
                        const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService')
                        if (!Array.isArray(perfilP.inventario)) perfilP.inventario = []
                        if (perfilP.inventario.length < (perfilP.mochila || 20) && Math.random() < 0.35) {
                            const equip = sortearEquipamentoDrop((perfilP.level || 1) + 10)
                            if (equip) {
                                perfilP.inventario.push({ ...equip })
                                relatorioRecompensas += '✨ *Equipamento:* ' + equip.raridade + ' ' + equip.nome +
                                    ' (+' + equip.cp + ' CP) — `.equipar ' + equip.id + '`\n'
                            }
                        }
                    } catch (equipErr) {
                        logger.warn('[BOSS] Falha no drop de equipamento: ' + equipErr.message)
                    }
                })

                await dataService.saveXpData(xpData)
                await dataService.saveBossData(bossData)
                logger.info('[BOSS MORTO] Boss ' + boss.nome + ' derrotado por ' + participantes.length + ' jogadores')

                return reply(relatorioRecompensas, participantes)
            }

            await dataService.saveXpData(xpData)
            await dataService.saveBossData(bossData)

            const codinomeUser = user.nicknameRpg ? `*${user.nicknameRpg}* (@${sender.split('@')[0]})` : `@${sender.split('@')[0]}`

            let docAtk = `╔══════════════════════════════╗\n`
            docAtk += `║    ⚔️ *GOLPE DESFERIDO NO BOSS* ⚔️   ║\n`
            docAtk += `╚══════════════════════════════╝\n\n`
            docAtk += `👤 *Guerreiro:* ${codinomeUser}\n`
            docAtk += `🗡️ *Arma Empunhada:* *${armaNome}* (Poder: ⚡ ${stats.cp} CP)\n`
            docAtk += `💥 *Dano Desferido:* *-${dano.toLocaleString('pt-BR')} HP* (🩸 *${percentDamageDealt}% do Boss*)\n`
            if (procs.length > 0) docAtk += `✨ *Bônus Aplicados:* ${procs.join(', ')}\n`
            docAtk += `\n╭━〔 🐉 STATUS DO CHEFE 〕━⬣\n`
            docAtk += `┃ 👑 *${boss.nome}* (${boss.raridade})\n`
            docAtk += `┃ ❤️ *HP:* ${Math.max(0, boss.vida).toLocaleString('pt-BR')} / ${boss.vidaMax.toLocaleString('pt-BR')}\n`
            docAtk += `┃ 📊 [${makeHpBar(remainingBossPercent)}] ${remainingBossPercent}%\n`
            docAtk += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            docAtk += `💔 *Contra-ataque sofrido:* -${danoBoss} HP | ❤️ *Seu HP:* ${user.hp} / ${stats.hpMax}\n`
            docAtk += `💡 _Digite \`.boss atk\` para atacar novamente!_`

            return reply(docAtk, [sender])
        }

        return reply('🐉 *SISTEMA DE BOSSES*\n\n• *.boss lista* — Ver todos os Bosses\n• *.boss criar [nome]* — Invocar Boss do mundo atual\n• *.boss atk* ou *.atk* — Atacar seu Boss\n• *.boss ajudar @usuario* — Ajudar outro jogador na luta\n• *.boss loot* — Ver tabela de drops')
    }
}