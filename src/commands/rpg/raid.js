/**
 * Comando .raid
 * Sistema de Raids Cooperativas Globais e de Grupo contra Bosses Titânicos
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { aplicarBonusDano } = require("../../services/rpgService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")
const { resolveHp } = require("../../services/characterEngine")

const RAID_BOSSES = {
    "reidemonio": {
        nome: "Rei Demônio (Forma Primordial)",
        vidaBase: 80000,
        mult: 3.5,
        loot: ["👑 Coroa do Rei Demônio", "🗡️ Espada da Escuridão", "🧬 Fragmento Mandamento"],
        descricao: "O soberano supremo do Clã dos Demônios em sua forma colossal."
    },
    "deusasuprema": {
        nome: "Deusa Suprema (Luz Divina)",
        vidaBase: 75000,
        mult: 3.2,
        loot: ["✨ Asas do Arcanjo", "☀️ Centelha do Sol Cruel", "🛡️ Escudo da Graça"],
        descricao: "A governante do Clã das Deusas detentora das Quatro Graças."
    },
    "lostvayne": {
        nome: "Dragão da Ira Lostvayne",
        vidaBase: 60000,
        mult: 2.8,
        loot: ["🐉 Escama do Dragão Lostvayne", "🗡️ Lâmina Quebrada Sagrada"],
        descricao: "A manifestação titânica da fúria do Dragão de Meliodas."
    },
    "mael": {
        nome: "Mael (4 Mandamentos Corrompido)",
        vidaBase: 70000,
        mult: 3.0,
        loot: ["🪽 Pluma Corrompida", "⚡ Raio da Punição Divina"],
        descricao: "O Arcanjo mais forte corrompido pelas trevas dos Mandamentos."
    }
}

function barraVida(atual, max) {
    const totalBars = 10
    const ratio = Math.max(0, Math.min(1, atual / max))
    const filled = Math.round(ratio * totalBars)
    return "█".repeat(filled) + "░".repeat(totalBars - filled) + " (" + Math.round(ratio * 100) + "%)"
}

module.exports = {
    name: "raid",
    aliases: ["bossraid", "raidboss", "coopraid"],
    category: "rpg",
    description: "Batalhas cooperativas de Raid contra Bosses Titânicos com todo o grupo",
    groupOnly: true,
    cooldownMs: 2500,
    execute: async ({ from, sender, args, reply, client, info }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        // As raids ficavam em bossData.raids, mas o saveBossData() só persiste
        // `lutas` — o objeto era jogado fora no save e o `.raid atk` seguinte
        // não achava nada. Agora usam armazenamento próprio e persistente.
        const raids = dataService.getRaidsData()
        const raidKey = from
        const currentRaid = raids[raidKey]

        const sub = (args[0] || "").toLowerCase().trim()

        // 1. CRIAR RAID NO GRUPO
        if (sub === "criar" || sub === "invocar" || sub === "iniciar") {
            if (currentRaid && currentRaid.ativo && currentRaid.vida > 0) {
                return reply("❌ Já existe uma Raid ativa neste grupo!\n\nUse \`.raid atk\` para participar ou \`.raid status\` para ver o progresso.")
            }

            const chosenKey = args[1] ? args[1].toLowerCase().replace(/[^a-z0-9]/g, "") : "lostvayne"
            const template = RAID_BOSSES[chosenKey] || RAID_BOSSES["lostvayne"]

            raids[raidKey] = {
                id: chosenKey,
                nome: template.nome,
                vida: template.vidaBase,
                vidaMax: template.vidaBase,
                mult: template.mult,
                loot: template.loot,
                dano: {},
                criador: sender,
                ativo: true,
                inicio: Date.now()
            }

            dataService.saveRaidsData(raids)
            logger.info("[RAID CRIADA] Grupo " + from + " invocou Raid: " + template.nome)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   🐉 *NOVA BOSS RAID INICIADA!* 🐉  ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += "🔥 *Boss Titânico:* *" + template.nome + "*\n"
            doc += "❤️ *Vida Total:* " + template.vidaBase.toLocaleString("pt-BR") + " HP\n"
            doc += "📜 *Descrição:* _" + template.descricao + "_\n\n"
            doc += "🎁 *Drops Raros:* " + template.loot.join(", ") + "\n\n"
            doc += "⚔️ *COMO PARTICIPAR:*\n"
            doc += "Todos os membros do grupo podem digitar \`.raid atk\` ou \`.atk\` para causar dano e ganhar recompensas proporcionais!"

            return reply(doc.trim(), [sender])
        }

        // 2. ATACAR O BOSS DA RAID
        if (sub === "atk" || sub === "atacar" || sub === "golpe" || !sub) {
            if (!currentRaid || !currentRaid.ativo || currentRaid.vida <= 0) {
                return reply("❌ Não há nenhuma Boss Raid ativa neste grupo no momento.\n\nPara invocar uma Raid, use: \`.raid criar lostvayne\` ou \`.raid bosses\`!")
            }

            const level = user.level || 1
            let poderBase = (level * 25) + 150 + Math.floor(Math.random() * 80)
            let dano = poderBase

            // Bônus de Classes no Raid
            const classe = user.classe || "nenhuma"
            if (classe === "guerreiro") dano = Math.floor(dano * 1.5) + 100
            if (classe === "mago") dano = Math.floor(dano * 1.8) + 120
            if (classe === "arqueiro") dano = Math.floor(dano * 1.7) + 150
            if (classe === "ladino") dano = Math.floor(dano * 1.9) + 200
            if (classe === "paladino") dano = Math.floor(dano * 1.6) + 130
            if (classe === "berserker") dano = Math.floor(dano * 2.0) + 250
            if (classe === "necromante") dano = Math.floor(dano * 1.7) + 100
            if (classe === "curandeiro") dano = Math.floor(dano * 1.4) + 80

            if (user.classeLendaria) {
                dano += 500
                if (Math.random() < 0.35) dano = Math.floor(dano * 2)
            }

            dano = Math.floor(aplicarBonusDano(user, dano))
            if (dano < 10) dano = 10

            currentRaid.vida -= dano
            if (!currentRaid.dano[sender]) currentRaid.dano[sender] = 0
            currentRaid.dano[sender] += dano

            // Dano que o jogador sofre do Boss de Raid
            const danoBoss = Math.floor(Math.random() * 35) + 15
            user.hp = Math.max(1, (user.hp || 100) - danoBoss)

            // VITÓRIA NA RAID (BOSS ELIMINADO)
            if (currentRaid.vida <= 0) {
                currentRaid.vida = 0
                currentRaid.ativo = false

                const participantes = Object.keys(currentRaid.dano)
                const mult = currentRaid.mult || 3.0

                let vitoriaDoc = `╔══════════════════════════════╗\n`
                vitoriaDoc += `║   🏆 *BOSS RAID DERROTADO!* 🏆   ║\n`
                vitoriaDoc += `╚══════════════════════════════╝\n\n`
                vitoriaDoc += `👑 *O Titã ${currentRaid.nome}* foi aniquilado pelo grupo!\n\n`
                vitoriaDoc += `🎁 *PREMIAÇÃO PROPORCIONAL DISTRIBUÍDA:*\n`

                participantes.sort((a, b) => currentRaid.dano[b] - currentRaid.dano[a])

                participantes.forEach((pUser, rankIdx) => {
                    const pProfile = initializeUser(pUser, xpData)
                    pProfile.bossesMortos = (pProfile.bossesMortos || 0) + 1

                    const userDmg = currentRaid.dano[pUser]
                    require('../../services/bossHistoryService')
                        .registrarAbate(pProfile, currentRaid, { dano: userDmg, tipo: 'raid' })
                    const dmgPercent = ((userDmg / currentRaid.vidaMax) * 100).toFixed(1)

                    const xpAward = Math.floor((300 + (userDmg / 4)) * mult)
                    const coinsAward = Math.floor((600 + (userDmg / 2)) * mult)

                    pProfile.xp = (pProfile.xp || 0) + xpAward
                    pProfile.coins = (pProfile.coins || 0) + coinsAward

                    const medal = rankIdx === 0 ? "🥇" : (rankIdx === 1 ? "🥈" : (rankIdx === 2 ? "🥉" : "🎖️"))
                    vitoriaDoc += `\n${medal} @${pUser.split('@')[0]}:\n`
                    vitoriaDoc += `⚔️ Dano Causado: *${userDmg.toLocaleString('pt-BR')} (${dmgPercent}%)*\n`
                    vitoriaDoc += `⭐ +${xpAward.toLocaleString('pt-BR')} XP | 💰 +${coinsAward.toLocaleString('pt-BR')} Coins\n`

                    // Drop de loot raro proporcional ao rank
                    if (Math.random() < 0.45 && currentRaid.loot && currentRaid.loot.length > 0) {
                        const drop = currentRaid.loot[Math.floor(Math.random() * currentRaid.loot.length)]
                        if (!pProfile.inventario) pProfile.inventario = []
                        pProfile.inventario.push(drop)
                        vitoriaDoc += `🎁 *Drop Especial:* ${drop}!\n`
                    }
                })

                delete raids[raidKey]
                await dataService.saveXpData(xpData)
                dataService.saveRaidsData(raids)

                logger.info(`[RAID VENCIDA] Grupo ${from} venceu Raid com ${participantes.length} jogadores`)
                return reply(vitoriaDoc.trim(), participantes)
            }

            await dataService.saveXpData(xpData)
            dataService.saveRaidsData(raids)

            const barra = barraVida(currentRaid.vida, currentRaid.vidaMax)
            let atkDoc = `⚔️ *ATAQUE NA BOSS RAID!*\n\n`
            atkDoc += `🐉 *Boss:* ${currentRaid.nome}\n`
            atkDoc += `🩸 *Vida da Raid:* ${barra}\n`
            atkDoc += `❤️ ${Math.max(0, currentRaid.vida).toLocaleString('pt-BR')} / ${currentRaid.vidaMax.toLocaleString('pt-BR')} HP\n\n`
            atkDoc += `💥 *Seu Golpe:* Causou *${dano.toLocaleString('pt-BR')} de dano*!\n`
            atkDoc += `📊 *Seu Dano Total:* ${currentRaid.dano[sender].toLocaleString('pt-BR')} HP\n`
            atkDoc += `💔 *Contra-ataque sofrido:* -${danoBoss} HP (Seu HP: ${user.hp}/${resolveHp(user).max})`

            return reply(atkDoc.trim(), [sender])
        }

        // 3. STATUS DA RAID ATIVA
        if (sub === "status" || sub === "info" || sub === "rank") {
            if (!currentRaid || !currentRaid.ativo) {
                return reply("❌ Nenhuma Boss Raid em andamento neste grupo.\n\nUse \`.raid criar\` para iniciar uma!")
            }

            const barra = barraVida(currentRaid.vida, currentRaid.vidaMax)
            const participantes = Object.entries(currentRaid.dano || {}).sort((a, b) => b[1] - a[1])

            let doc = "╔══════════════════════════════╗\n"
            doc += "║    🐉 *STATUS DA BOSS RAID* 🐉   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += "👑 *Boss Titânico:* *" + currentRaid.nome + "*\n"
            doc += "🩸 *Vida Restante:* " + barra + "\n"
            doc += "❤️ " + Math.max(0, currentRaid.vida).toLocaleString("pt-BR") + " / " + currentRaid.vidaMax.toLocaleString("pt-BR") + " HP\n\n"
            doc += "╭━〔 ⚔️ TOP CONTRIBUIDORES 〕━⬣\n"
            if (participantes.length > 0) {
                participantes.slice(0, 5).forEach(([pUser, dmg], i) => {
                    const percent = ((dmg / currentRaid.vidaMax) * 100).toFixed(1)
                    doc += "┃ #" + (i + 1) + " @" + pUser.split("@")[0] + " ➔ *" + dmg.toLocaleString("pt-BR") + " HP* (" + percent + "%)\n"
                })
            } else {
                doc += "┃ ▫️ Nenhum ataque registrado ainda.\n"
            }
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            doc += "💡 _Digite_ \`.raid atk\` _para desferir seu golpe!_"

            return reply(doc.trim(), participantes.map(p => p[0]))
        }

        // 4. CATÁLOGO DE BOSSES DE RAID
        if (sub === "bosses" || sub === "lista" || sub === "list") {
            let cat = "╔══════════════════════════════╗\n"
            cat += "║   🐉 *BOSSES DE RAID TITÃS* 🐉   ║\n"
            cat += "╚══════════════════════════════╝\n\n"
            Object.entries(RAID_BOSSES).forEach(([k, b]) => {
                cat += "╭━〔 👑 " + b.nome + " 〕━⬣\n"
                cat += "┃ 🆔 *Código:* \`" + k + "\`\n"
                cat += "┃ ❤️ *Vida:* " + b.vidaBase.toLocaleString("pt-BR") + " HP\n"
                cat += "┃ 🎁 *Drops:* " + b.loot.join(", ") + "\n"
                cat += "┃ 📜 _" + b.descricao + "_\n"
                cat += "┃ 💡 *Invocar:* \`.raid criar " + k + "\`\n"
                cat += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            })
            return reply(cat.trim())
        }

        return reply("🐉 *SISTEMA DE RAID COOPERATIVA*\n\n• \`.raid criar [boss]\` — Invocar Boss de Raid no grupo\n• \`.raid atk\` — Desferir golpe na Raid ativa\n• \`.raid status\` — Ver barra de vida e ranking de dano\n• \`.raid bosses\` — Listar todos os Bosses Titânicos")
    }
}
