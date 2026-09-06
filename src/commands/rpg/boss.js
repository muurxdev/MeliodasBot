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

        bossData.ultimoBoss = bossData.ultimoBoss || {}

        if (subCmd === 'reviver' || subCmd === 'voltar' || subCmd === 'respawn') {
            const ultimo = bossData.ultimoBoss[idLuta]
            if (!ultimo) {
                return reply('❌ Nenhum Boss recente registrado nesta sala para reviver.\n\n💡 Use: `.boss criar [nome]` ou `.boss lista`')
            }
            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply(`⚠️ Já existe um Boss ativo na sala (*${bossData.lutas[idLuta].nome}*)!\nUse: \`.boss atk\``)
            }
            bossData.lutas[idLuta] = gerarBoss(ultimo.id)
            bossData.lutas[idLuta].dono = donoBoss
            await dataService.saveBossData(bossData)
            logger.info('[BOSS REVIVER] Boss ' + bossData.lutas[idLuta].nome + ' ressuscitado por ' + sender)
            return reply(`🐉 *O BOSS RETORNOU DO PURGATÓRIO!*\n\n👑 *${bossData.lutas[idLuta].nome}* (${bossData.lutas[idLuta].raridade}) renasceu com fúria cósmica!\n❤️ Vida: ${bossData.lutas[idLuta].vida.toLocaleString('pt-BR')} / ${bossData.lutas[idLuta].vidaMax.toLocaleString('pt-BR')} HP\n\n⚔️ Use *.boss atk* ou *.atk* para combater!`, [sender])
        }

        if (subCmd === 'criar') {
            const mundoAtualBoss = mundos[user.mundo || 'floresta']
            const bossEscolhido = param || mundoAtualBoss.bosses[0]

            if (!bosses[bossEscolhido]) {
                return reply(`❌ Boss \`${bossEscolhido}\` não existe.\n\n💡 Digite \`.boss lista\` para ver todos os chefes disponíveis!`)
            }

            let bossMundo = null
            for (const [mKey, mVal] of Object.entries(mundos)) {
                if (mVal.bosses && mVal.bosses.includes(bossEscolhido)) {
                    bossMundo = mVal
                    break
                }
            }

            const isReborn = Number(user.rebirthCount || user.rebirth_count || 0) > 0
            const userLevel = Number(user.level || 1)
            const hasLevel = bossMundo ? userLevel >= bossMundo.minLevel : true
            const jaDerrotou = user.extra?.bossesResumo && user.extra.bossesResumo[bosses[bossEscolhido].nome]
            let isOwner = false
            try {
                const { isOwner: checkOwner } = require('../../services/ownerService')
                isOwner = checkOwner(sender)
            } catch (_) {}

            const podeInvocar = mundoAtualBoss.bosses.includes(bossEscolhido) || isReborn || hasLevel || jaDerrotou || isOwner

            if (!podeInvocar) {
                return reply('🚫 *Boss Bloqueado!*\n\n🐉 Boss: ' + bosses[bossEscolhido].nome + '\n🌍 Requer Mundo: ' + (bossMundo ? bossMundo.nome : 'Avançado') + ` (Nível ${bossMundo?.minLevel || '?'})\n❌ Avance com \`.viajar\` ou faça Rebirth (\`.reencarnar\`) para transcender as fronteiras de mundo!`)
            }

            if (bossData.lutas[idLuta] && bossData.lutas[idLuta].ativo) {
                return reply('❌ Você já possui um Boss ativo nesta sala!\n\nUse: .boss atk ou .atk')
            }

            bossData.lutas[idLuta] = gerarBoss(bossEscolhido)
            bossData.lutas[idLuta].dono = donoBoss

            await dataService.saveBossData(bossData)
            logger.info('[BOSS CRIAR] User ' + sender + ' invocou boss ' + bossData.lutas[idLuta].nome)

            return reply('🐉 *BOSS INVOCADO COM SUCESSO!*\n\n👑 *Invocador:* @' + sender.split('@')[0] + '\n🧬 *Boss:* ' + bossData.lutas[idLuta].nome + '\n✨ *Raridade:* ' + bossData.lutas[idLuta].raridade + '\n❤️ *Vida:* ' + bossData.lutas[idLuta].vida.toLocaleString('pt-BR') + ' / ' + bossData.lutas[idLuta].vidaMax.toLocaleString('pt-BR') + '\n\nUse *.boss atk* ou *.atk* para atacar!', [sender])
        }

        if (subCmd === 'atk' || subCmd === 'atacar' || subCmd === 'ajudar' || subCmd === 'ajd') {
            const bossEntry = bossData.lutas[idLuta]
            if (!bossEntry || !bossEntry.ativo || bossEntry.vida <= 0) {
                delete bossData.lutas[idLuta]
                await dataService.saveBossData(bossData)
                const ultimo = bossData.ultimoBoss?.[idLuta]
                if (ultimo) {
                    return reply(`❌ Nenhum Boss ativo no momento!\n\n💡 O último chefe enfrentado nesta sala foi *${ultimo.nome}*.\n👉 Digite *.boss reviver* ou *.boss voltar* para trazê-lo de volta imediatamente!\n👉 Ou digite *.boss criar [nome]* para invocar outro chefe.`)
                }
                return reply('❌ Nenhum Boss ativo encontrado para lutar.\n\nUse: .boss criar bug ou .boss lista')
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
            if (stats.rebirths > 0) {
                procs.push(`🌀 Rebirth ${stats.rebirths}x (+${stats.rebirths * 25}% Dano)`)
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

            // Dano agressivo escalonado: bosses com milhões de HP desferem golpes brutais
            const danoBaseBoss = boss.danoBase || Math.max(30, Math.floor(boss.vidaMax * 0.0012))
            const danoBossRaw = Math.floor(danoBaseBoss * (0.85 + (Math.random() * 0.30)))
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

                return reply('💀 *VOCÊ MORREU NO COMBATE!*\n\n🐉 O Boss desferiu um ataque devastador de ' + danoBoss.toLocaleString('pt-BR') + ' de dano!\n❤️ Seu HP foi restaurado para ' + user.hp + '/' + stats.hpMax + '.\n⚠️ Você não conseguiu causar dano no Boss nesta rodada.')
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
                bossData.ultimoBoss[idLuta] = { id: boss.id, nome: boss.nome }
                delete bossData.lutas[idLuta]

                const { processarLevelUp, aplicarBonusRebirthXp } = require('../../services/xpService')
                const participantes = Object.keys(boss.dano)
                const mult = boss.multiplicador || 1
                let relatorioRecompensas = '🏆 *BOSS DERROTADO COM SUCESSO!*\n\n👑 *' + boss.nome + '* (' + boss.raridade + ') foi eliminado!\n\n🎁 *RECOMPENSAS DISTRIBUÍDAS:*\n'

                participantes.forEach(pUser => {
                    const perfilP = initializeUser(pUser, xpData)
                    perfilP.bossesMortos = (perfilP.bossesMortos || 0) + 1
                    perfilP.wins = (perfilP.wins || 0) + 1

                    const danoP = boss.dano[pUser]
                    require('../../services/bossHistoryService')
                        .registrarAbate(perfilP, boss, { dano: danoP, tipo: 'boss' })
                    const xpBase = Math.floor((100 + danoP / 5) * mult)
                    const xpGanho = aplicarBonusRebirthXp(perfilP, xpBase)
                    const coinsGanho = Math.floor((200 + danoP / 3) * mult)

                    perfilP.xp = (perfilP.xp || 0) + xpGanho
                    perfilP.coins = (perfilP.coins || 0) + coinsGanho

                    const lvlResult = processarLevelUp(perfilP)

                    relatorioRecompensas += '\n👤 @' + pUser.split('@')[0] + ':\n'
                    relatorioRecompensas += '⚔️ Dano Total: ' + danoP.toLocaleString('pt-BR') + ' (' + Math.round((danoP / boss.vidaMax) * 100) + '% do Chefe)\n'
                    const rebText = (perfilP.rebirthCount || perfilP.rebirth_count) ? ` _(+${(perfilP.rebirthCount || perfilP.rebirth_count) * 25}% Rebirth)_` : ''
                    relatorioRecompensas += '⭐ +' + xpGanho.toLocaleString('pt-BR') + ' XP' + rebText + ' | 💰 +' + coinsGanho.toLocaleString('pt-BR') + ' Coins\n'
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

                relatorioRecompensas += '\n🐉 *O CHEFE CAIU, MAS SUA ALMA PODE RETORNAR!*\n'
                relatorioRecompensas += '💡 _Digite_ *.boss reviver* _ou_ *.boss voltar* _para trazê-lo de volta imediatamente e continuar a caçada!_\n'

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
            docAtk += `💔 *Contra-ataque sofrido:* -${danoBoss.toLocaleString('pt-BR')} HP | ❤️ *Seu HP:* ${user.hp} / ${stats.hpMax}\n`
            docAtk += `💡 _Digite \`.boss atk\` para atacar novamente!_`

            return reply(docAtk, [sender])
        }

        return reply('🐉 *SISTEMA DE BOSSES*\n\n• *.boss lista* — Ver todos os Bosses\n• *.boss criar [nome]* — Invocar Boss\n• *.boss reviver* ou *.boss voltar* — Reviver o último Boss derrotado\n• *.boss atk* ou *.atk* — Atacar seu Boss\n• *.boss ajudar @usuario* — Ajudar outro jogador na luta\n• *.boss loot* — Ver tabela de drops')
    }
}