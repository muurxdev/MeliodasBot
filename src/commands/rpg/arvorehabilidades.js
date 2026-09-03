const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const SKILLS = {
    ataque: { nome: '⚔️ Ataque', custo: 2, descricao: '+10% dano em batalhas', bonus: 'atk' },
    defesa: { nome: '🛡️ Defesa', custo: 2, descricao: '+10% redução de dano recebido', bonus: 'def' },
    magia: { nome: '🔮 Magia', custo: 3, descricao: 'Habilidade de dano mágico em batalha', bonus: 'mag' },
    cura: { nome: '💚 Cura', custo: 3, descricao: 'Habilidade de cura em batalha', bonus: 'heal' },
    sorte: { nome: '🍀 Sorte', custo: 2, descricao: '+15% chance de drop raro e crítico', bonus: 'lck' }
}

module.exports = {
    name: 'arvorehabilidades',
    aliases: ['skilltree', 'habilidades', 'arvhab'],
    category: 'rpg',
    subcategory: 'Progressão',
    description: 'Árvore de habilidades — desbloqueie e gerencie suas skills',
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const skillPoints = Math.floor((user.level || 1) / 5)
        const unlockedSkills = user.skills || []

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'ver' || sub === 'lista') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🌳 *ÁRVORE DE HABILIDADES* 🌳   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `📊 *Pontos Disponíveis:* ${skillPoints} pts\n`
            doc += `📈 *Nível Atual:* ${user.level || 1}\n`
            doc += `💡 _1 ponto a cada 5 níveis_\n\n`

            doc += '╭━━━〔 📋 SKILLS DISPONÍVEIS 〕━━━┈⊷\n'
            Object.entries(SKILLS).forEach(([key, s]) => {
                const has = unlockedSkills.includes(key)
                const status = has ? '✅ Desbloqueada' : `🔒 Custo: ${s.custo} pts`
                doc += `┃ ${s.nome} (${key})\n`
                doc += `┃ ${s.descricao}\n`
                doc += `┃ Status: ${status}\n`
                doc += `┃ ─────────────────\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n'
            doc += '💡 _Desbloqueie com_ \`.arvorehabilidades desbloquear <nome>\`_\n'
            doc += '💡 _Skills desbloqueadas dão bônus passivos + desbloqueiam .habilidade em batalha!_'

            return reply(doc.trim(), [sender])
        }

        if (sub === 'desbloquear' || sub === 'comprar' || sub === 'unlock') {
            const skillName = (args[1] || '').toLowerCase()

            if (!skillName || !SKILLS[skillName]) {
                return reply('❌ Skill inválida! Skills disponíveis: ataque, defesa, magia, cura, sorte\nEx: `.arvorehabilidades desbloquear ataque`')
            }

            if (unlockedSkills.includes(skillName)) {
                return reply(`❌ Você já desbloqueou a skill *${SKILLS[skillName].nome}*!`)
            }

            const skill = SKILLS[skillName]

            if (skillPoints < skill.custo) {
                return reply(`❌ Pontos insuficientes!\n\n📊 *Seus Pontos:* ${skillPoints}\n📊 *Custo Necessário:* ${skill.custo}\n📈 *Nível Atual:* ${user.level || 1}\n💡 _Ganhe mais pontos subindo de nível (1 a cada 5 níveis)_`)
            }

            if (!user.skills) user.skills = []
            user.skills.push(skillName)

            await dataService.saveXpData(xpData)
            logger.info(`[SKILLTREE] ${sender} desbloqueou skill ${skillName}`)

            let doc = '🎉 *SKILL DESBLOQUEADA!*\n\n'
            doc += `${skill.nome}\n`
            doc += `📝 *Descrição:* ${skill.descricao}\n`
            doc += `📊 *Pontos Restantes:* ${skillPoints - skill.custo}\n\n`
            doc += `💡 _Use_ \`.habilidade ${skillName}\` _em batalha para ativar o efeito!_`

            return reply(doc.trim(), [sender])
        }

        return reply('❌ Opção inválida! Use:\n• `.arvorehabilidades` — Ver árvore\n• `.arvorehabilidades desbloquear <nome>` — Desbloquear skill')
    }
}
