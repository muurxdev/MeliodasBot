/**
 * Comando .lendaria / .classelendaria / .lendarias
 * Classes lendárias supremas — visualização, info e desbloqueio
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classesLendarias } = require('../../utils/constants')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'lendaria',
    aliases: ['classelendaria', 'lendarias'],
    category: 'rpg',
    subcategory: 'Classes',
    description: 'Classes lendárias supremas com habilidades passivas de combate',
    cooldownMs: 2000,
    execute: async ({ args, sender, reply }) => {
        const botName = getBotName()
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nome = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'lista') {
            let texto = `╔══════════════════════════════╗\n`
            texto += `║   👑 *CLASSES LENDÁRIAS SUPREMAS* 👑   ║\n`
            texto += `╚══════════════════════════════╝\n\n`

            Object.entries(classesLendarias).forEach(([id, l]) => {
                texto += `╭━〔 ${l.nome} 〕━⬣\n`
                texto += `┃ 📌 *Requisito:* ${l.requisito}\n`
                texto += `┃ 🌟 *Habilidade:* ${l.habilidade}\n`
                texto += `┃ 🛒 *Desbloquear:* \`.lendaria desbloquear ${id}\`\n`
                texto += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            texto += `💡 _Info:_ \`.lendaria info <id>\`\n`
            texto += `👑 *${botName}*`
            return reply(texto.trim())
        }

        if (acao === 'info') {
            if (!nome) return reply(`❌ Use: \`.lendaria info [nome]\`\nExemplo: \`.lendaria info dragonite\``)
            const l = classesLendarias[nome]
            if (!l) return reply('❌ Classe lendária não encontrada. Use `.lendaria lista`.')

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🔮 *CLASSE LENDÁRIA* 🔮   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `✨ *Nome:* ${l.nome}\n`
            doc += `📌 *Requisito:* ${l.requisito}\n`
            doc += `🌟 *Habilidade:* ${l.habilidade}\n\n`

            if (l.loots && l.loots.length > 0) {
                doc += `📦 *Loots Necessários:*\n`
                l.loots.forEach(item => { doc += `┃ • ${item}\n` })
                doc += `\n`
            }

            doc += `🛒 *Desbloquear:* \`.lendaria desbloquear ${nome}\``
            return reply(doc.trim())
        }

        if (acao === 'desbloquear') {
            if (!nome) return reply(`❌ Use: \`.lendaria desbloquear [nome]\`\nExemplo: \`.lendaria desbloquear dragonite\``)
            const lendariaEscolhida = classesLendarias[nome]
            if (!lendariaEscolhida) return reply('❌ Classe lendária não encontrada. Use `.lendaria lista`.')

            // Verificar requisitos
            if (nome === 'dragonite') {
                if (user.level < 60) return reply('❌ Requisito não atingido: Você precisa ser nível 60.')
                if ((user.bossesMortos || 0) < 30) return reply('❌ Requisito não atingido: Você precisa derrotar 30 Bosses.')
            }
            if (nome === 'lordesombras') {
                if (user.level < 50) return reply('❌ Requisito não atingido: Você precisa ser nível 50.')
                const totalDano = (user.totalDamage || user.total_damage || 0)
                if (totalDano < 1000) return reply('❌ Requisito não atingido: Você precisa causar 1000+ de dano total.')
            }
            if (nome === 'arcanosupremo') {
                if (user.level < 80) return reply('❌ Requisito não atingido: Você precisa ser nível 80.')
                if ((user.bossesMortos || 0) < 50) return reply('❌ Requisito não atingido: Você precisa derrotar 50 Bosses.')
            }
            if (nome === 'sentinela') {
                if (user.level < 70) return reply('❌ Requisito não atingido: Você precisa ser nível 70.')
                const totalDef = (user.totalDef || user.total_def || 0)
                if (totalDef < 200) return reply('❌ Requisito não atingido: Você precisa acumular 200+ de defesa total.')
            }
            if (nome === 'pecado_ira') {
                if (user.level < 60) return reply('❌ Requisito não atingido: Você precisa ser nível 60.')
                if ((user.bossesMortos || 0) < 30) return reply('❌ Requisito não atingido: Você precisa derrotar 30 Bosses.')
            }
            if (nome === 'meliodas_assault') {
                if (user.level < 80) return reply('❌ Requisito não atingido: Você precisa ser nível 80.')
                if ((user.bossesMortos || 0) < 100) return reply('❌ Requisito não atingido: Você precisa derrotar 100 Bosses.')
                if ((user.wins || 0) < 50) return reply('❌ Requisito não atingido: Você precisa de 50 vitórias em duelos.')
            }

            // Verificar loots necessários
            if (lendariaEscolhida.loots && lendariaEscolhida.loots.length > 0) {
                const inventario = Array.isArray(user.inventario) ? user.inventario : []
                const faltando = lendariaEscolhida.loots.filter(item => {
                    return !inventario.some(i => {
                        if (typeof i === 'object' && i !== null) {
                            return (i.nome && i.nome.includes(item)) || (i.id && i.id.includes(item))
                        }
                        return typeof i === 'string' && i.includes(item)
                    })
                })

                if (faltando.length > 0) {
                    return reply(
                        `❌ *Faltam loots necessários!*\n\n` +
                        `🔮 *Classe:* ${lendariaEscolhida.nome}\n\n` +
                        `📦 *Loots pendentes:*\n` + faltando.map(i => `• ${i}`).join('\n')
                    )
                }

                // Remover loots do inventário
                lendariaEscolhida.loots.forEach(item => {
                    const idx = user.inventario.findIndex(i => {
                        if (typeof i === 'object' && i !== null) {
                            return (i.nome && i.nome.includes(item)) || (i.id && i.id.includes(item))
                        }
                        return typeof i === 'string' && i.includes(item)
                    })
                    if (idx !== -1) user.inventario.splice(idx, 1)
                })
            }

            user.classeLendaria = nome
            if (nome === 'meliodas_assault') {
                user.hpMax = (user.hpMax || 100) + 200
                user.hp = user.hpMax
            }
            await dataService.saveXpData(xpData)
            logger.info(`[LENDARIA] ${sender} desbloqueou classe lendária ${nome}`)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🌟 *CLASSE LENDÁRIA DESBLOQUEADA!* 🌟   ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `✨ *${lendariaEscolhida.nome}*\n`
            doc += `🌟 *Habilidade Ativa:* ${lendariaEscolhida.habilidade}\n\n`
            doc += `👑 *${botName}*`

            return reply(doc.trim())
        }

        return reply('❌ Opção inválida. Use:\n• `.lendaria lista` — Ver todas\n• `.lendaria info [nome]` — Detalhes\n• `.lendaria desbloquear [nome]` — Desbloquear')
    }
}
