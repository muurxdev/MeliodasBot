const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const CONQUISTAS_CATALOGO = [
    { id: 'primeiro_login', nome: '🌱 Primeiro Login', descricao: 'Fazer login diário pela primeira vez', condicao: (u) => (u.streak || 0) >= 1 },
    { id: 'milionario', nome: '💰 Milionário', descricao: 'Acumular 1.000.000 de coins', condicao: (u) => (u.coins || 0) >= 1000000 },
    { id: 'guerreiro', nome: '⚔️ Guerreiro', descricao: 'Vencer 100 batalhas', condicao: (u) => (u.wins || 0) >= 100 },
    { id: 'mestre_rpg', nome: '🎮 Mestre RPG', descricao: 'Alcançar o nível 50', condicao: (u) => (u.level || 1) >= 50 },
    { id: 'checao', nome: '🐉 Chefão', descricao: 'Derrotar o dragão (50 bosses)', condicao: (u) => (u.bossesMortos || 0) >= 50 },
    { id: 'social', nome: '👥 Social', descricao: 'Ter 10 amigos (reps dadas)', condicao: (u) => (u.rep || 0) >= 10 },
    { id: 'ccionador', nome: '🎒 Colecionador', descricao: 'Ter 50 itens no inventário', condicao: (u) => (u.inventario || u.inventory || []).length >= 50 },
    { id: 'sortudo', nome: '🍀 Sortudo', descricao: 'Ganhar no crash 3 vezes', condicao: (u) => (u.crashWins || 0) >= 3 },
    { id: 'nobre', nome: '👑 Nobre', descricao: 'Alcançar nível 30', condicao: (u) => (u.level || 1) >= 30 },
    { id: 'estudante', nome: '📚 Estudante', descricao: 'Enviar 500 mensagens', condicao: (u) => (u.messages || 0) >= 500 },
    { id: 'veterano', nome: '🎖️ Veterano', descricao: 'Enviar 5000 mensagens', condicao: (u) => (u.messages || 0) >= 5000 },
    { id: 'lenda', nome: '🌟 Lenda', descricao: 'Alcançar o nível 100', condicao: (u) => (u.level || 1) >= 100 },
    { id: 'divino', nome: '⚡ Divino', descricao: 'Alcançar o nível 200', condicao: (u) => (u.level || 1) >= 200 },
    { id: 'dragao', nome: '🐉 Dragão da Destruição', descricao: 'Alcançar o nível 300', condicao: (u) => (u.level || 1) >= 300 },
    { id: 'supremo', nome: '👑 Rei Demônio Supremo', descricao: 'Alcançar o nível 500', condicao: (u) => (u.level || 1) >= 500 },
    { id: 'cosmico', nome: '🌌 Entidade Cósmica', descricao: 'Alcançar o nível 1000', condicao: (u) => (u.level || 1) >= 1000 },
    { id: 'primeira_cacada', nome: '🗡️ Primeira Caçada', descricao: 'Vencer 10 batalhas', condicao: (u) => (u.wins || 0) >= 10 },
    { id: 'arena_100', nome: '🏟️ Gladiador', descricao: 'Acumular 1000 pontos de arena', condicao: (u) => (u.arenaPontos || 0) >= 1000 },
    { id: 'streak_7', nome: '🔥 Dedicação Diária', descricao: 'Streak de 7 dias seguidos', condicao: (u) => (u.streak || 0) >= 7 },
    { id: 'streak_30', nome: '🔥 Mês Perfeito', descricao: 'Streak de 30 dias seguidos', condicao: (u) => (u.streak || 0) >= 30 },
    { id: 'coins_10k', nome: '💎 Riqueza', descricao: 'Acumular 10.000 coins', condicao: (u) => (u.coins || 0) >= 10000 },
    { id: 'coins_100k', nome: '💎 Fortuna', descricao: 'Acumular 100.000 coins', condicao: (u) => (u.coins || 0) >= 100000 },
    { id: 'forja_5', nome: '⚒️ Mestre Ferreiro', descricao: 'Alcançar nível 5 de forja', condicao: (u) => (u.forgeLevel || 0) >= 5 },
    { id: 'hp_500', nome: '❤️ Tanque', descricao: 'Ter 500+ de HP máximo', condicao: (u) => (u.hpMax || 100) >= 500 },
    { id: 'messages_10k', nome: '💬 Comunicador', descricao: 'Enviar 10.000 mensagens', condicao: (u) => (u.messages || 0) >= 10000 },
    { id: 'rebirth_1', nome: '🌀 Renascimento', descricao: 'Fazer 1 rebirth', condicao: (u) => (u.rebirthCount || 0) >= 1 },
]

function checarConquistas(user) {
    if (!user.conquistas) user.conquistas = []
    const novas = []
    for (const c of CONQUISTAS_CATALOGO) {
        if (!user.conquistas.includes(c.id) && c.condicao(user)) {
            user.conquistas.push(c.id)
            novas.push(c)
        }
    }
    return novas
}

module.exports = {
    name: 'conquistas',
    aliases: ['achiev', 'conquista', 'conqu'],
    category: 'profile',
    subcategory: 'Perfil & Ranking',
    description: 'Sistema de conquistas — veja seus feitos desbloqueados',
    cooldownMs: 3000,
    execute: async ({ args, sender, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const novas = checarConquistas(user)
        if (novas.length > 0) {
            await dataService.saveXpData(xpData)
            logger.info('[CONQUISTAS] User ' + sender + ' desbloqueou: ' + novas.map(n => n.id).join(', '))
        }

        const nomeBusca = args.join(' ').toLowerCase().trim()

        if (nomeBusca) {
            const encontrada = CONQUISTAS_CATALOGO.find(c =>
                c.id.toLowerCase().includes(nomeBusca) ||
                c.nome.toLowerCase().includes(nomeBusca)
            )
            if (!encontrada) {
                return reply('❌ Conquista não encontrada. Use `.conquistas` para ver todas.')
            }
            const desbloqueada = (user.conquistas || []).includes(encontrada.id)
            const status = desbloqueada ? '✅ Desbloqueada' : '🔒 Bloqueada'
            return reply(
                `🏆 *DETALHES DA CONQUISTA*\n\n` +
                `${encontrada.nome}\n` +
                `📝 *Descrição:* ${encontrada.descricao}\n` +
                `📊 *Status:* ${status}`
            )
        }

        const desbloqueadas = []
        const bloqueadas = []
        for (const c of CONQUISTAS_CATALOGO) {
            if ((user.conquistas || []).includes(c.id)) {
                desbloqueadas.push(c)
            } else {
                bloqueadas.push(c)
            }
        }

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        doc += `┃   🏆 *SISTEMA DE CONQUISTAS* 🏆   \n`
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`
        doc += `📊 *Progresso:* ${desbloqueadas.length}/${CONQUISTAS_CATALOGO.length} desbloqueadas\n\n`

        if (desbloqueadas.length > 0) {
            doc += `╭━━━〔 ✅ DESBLOQUEADAS 〕━━━┈⊷\n`
            for (const c of desbloqueadas) {
                doc += `┃ ${c.nome}\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`
        }

        if (bloqueadas.length > 0) {
            doc += `╭━━━〔 🔒 BLOQUEADAS 〕━━━┈⊷\n`
            for (const c of bloqueadas) {
                doc += `┃ ${c.nome} — _${c.descricao}_\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`
        }

        if (novas.length > 0) {
            doc += `🎉 *NOVAS CONQUISTAS DESBLOQUEADAS!*\n`
            for (const n of novas) {
                doc += `→ ${n.nome}\n`
            }
            doc += `\n`
        }

        doc += `💡 _Use_ \`.conquistas <nome>\` _para ver detalhes de uma conquista_`

        await reply(doc.trim())
    }
}
