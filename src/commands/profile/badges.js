const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const BADGES_CATALOGO = [
    { id: 'guerreiro', nome: '⚔️ Guerreiro', descricao: 'Mestre em combate corpo a corpo', desbloqueio: 'Vencer 50 batalhas' },
    { id: 'mago', nome: '🧙 Mago', descricao: 'Domina as artes arcanas', desbloqueio: 'Alcançar nível 40' },
    { id: 'curandeiro', nome: '💚 Curandeiro', descricao: 'Especialista em restaurar vida', desbloqueio: 'Ter 300+ HP máximo' },
    { id: 'ladrao', nome: '🗡️ Ladrão', descricao: 'Mestre em furtividade', desbloqueio: 'Ganhar no crash 5 vezes' },
    { id: 'nobre', nome: '👑 Nobre', descricao: 'Líder nato entre seus pares', desbloqueio: 'Ter 50+ reps' },
    { id: 'caçador', nome: '🏹 Caçador', descricao: 'Rastreador implacável', desbloqueio: 'Derrotar 30 bosses' },
    { id: 'forjador', nome: '⚒️ Forjador', descricao: 'Mestre das artes mecânicas', desbloqueio: 'Nível 3 de forja' },
    { id: 'explorador', nome: '🧭 Explorador', descricao: 'Conhece todos os recantos', desbloqueio: 'Visitar 10 mundos' },
    { id: 'social', nome: '💬 Social', descricao: 'O alma do grupo', desbloqueio: 'Enviar 1000 mensagens' },
    { id: 'lenda', nome: '🌟 Lenda Viva', descricao: 'Lenda entre os jogadores', desbloqueio: 'Nível 100+' },
]

module.exports = {
    name: 'badges',
    aliases: ['insignia', 'insignias', 'badge'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Sistema de badges — veja, colecione e equipa badges',
    cooldownMs: 3000,
    execute: async ({ args, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!user.badges) user.badges = []

        const acao = (args[0] || '').toLowerCase()

        if (acao === 'equip') {
            const badgeNome = args.slice(1).join(' ').toLowerCase().trim()
            if (!badgeNome) {
                return reply('❌ Uso: `.badges equip <nome>`\n\nExemplo: `.badges equip guerreiro`')
            }
            const badge = BADGES_CATALOGO.find(b =>
                b.id.toLowerCase().includes(badgeNome) ||
                b.nome.toLowerCase().includes(badgeNome)
            )
            if (!badge) {
                return reply('❌ Badge não encontrada. Use `.badges` para ver as disponíveis.')
            }
            if (!user.badges.includes(badge.id)) {
                return reply('❌ Você não possui esta badge. Desbloqueie-a primeiro!')
            }
            user.equippedBadge = badge.id
            await dataService.saveXpData(xpData)
            logger.info('[BADGES] User ' + sender + ' equipou badge: ' + badge.id)
            return reply(`✅ Badge *${badge.nome}* equipada com sucesso!\n\nEla agora aparecerá no seu perfil.`)
        }

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        doc += `┃   🏅 *SISTEMA DE BADGES* 🏅   \n`
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`

        if (user.equippedBadge) {
            const equipada = BADGES_CATALOGO.find(b => b.id === user.equippedBadge)
            doc += `📌 *Badge Equipada:* ${equipada ? equipada.nome : user.equippedBadge}\n\n`
        } else {
            doc += `📌 *Badge Equipada:* Nenhuma\n\n`
        }

        doc += `╭━━━〔 📋 DISPONÍVEIS 〕━━━┈⊷\n`
        for (const b of BADGES_CATALOGO) {
            const possuida = user.badges.includes(b.id)
            const status = possuida ? '✅' : '🔒'
            doc += `┃ ${status} ${b.nome}\n`
            doc += `┃   _${b.descricao}_\n`
            doc += `┃   📝 ${b.desbloqueio}\n`
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`

        doc += `📊 *Possuídas:* ${user.badges.length}/${BADGES_CATALOGO.length}\n\n`
        doc += `💡 _Use_ \`.badges equip <nome>\` _para equipar uma badge no seu perfil_`

        await reply(doc.trim())
    }
}
