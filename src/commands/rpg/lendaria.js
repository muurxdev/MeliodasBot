const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { classesLendarias } = require('../../utils/constants')
const logger = require('../../core/logger')

module.exports = {
    name: 'lendaria',
    aliases: ['classelendaria', 'lendarias'],
    category: 'rpg',
    description: 'Classes lendárias supremas com habilidades passivas de combate',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nome = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'lista') {
            let texto = '🔮 *CLASSES LENDÁRIAS SUPREMAS*\n\n'
            Object.entries(classesLendarias).forEach(([id, l]) => {
                texto += l.nome + ' (id: ' + id + ')\n📌 Requisito: ' + l.requisito + '\n✨ Habilidade: ' + l.habilidade + '\n\n'
            })
            texto += 'Para ver detalhes: *.lendaria info [nome]*\nPara desbloquear: *.lendaria desbloquear [nome]*'
            return reply(texto)
        }

        if (acao === 'info') {
            if (!nome) return reply('❌ Use: .lendaria info [nome]\nExemplo: .lendaria info arquiteto')
            const l = classesLendarias[nome]
            if (!l) return reply('❌ Classe lendária não encontrada. Use .lendaria lista.')

            return reply('🔮 *INFORMAÇÕES DA CLASSE LENDÁRIA*\n\n' + l.nome + '\n\n📌 *Requisito:* ' + l.requisito + '\n✨ *Habilidade:* ' + l.habilidade + '\n\nPara desbloquear use:\n*.lendaria desbloquear ' + nome + '*')
        }

        if (acao === 'desbloquear') {
            if (!nome) return reply('❌ Use: .lendaria desbloquear [nome]\nExemplo: .lendaria desbloquear arquiteto')
            const lendariaEscolhida = classesLendarias[nome]
            if (!lendariaEscolhida) return reply('❌ Classe lendária não encontrada. Use .lendaria lista.')

            if (nome === 'arquiteto' && user.level < 50) return reply('❌ Requisito não atingido: Você precisa ser nível 50.')
            if (nome === 'cloudlord' && (user.bossesMortos || 0) < 50) return reply('❌ Requisito não atingido: Você precisa derrotar 50 Bosses.')
            if (nome === 'deusfullstack' && user.level < 100) return reply('❌ Requisito não atingido: Você precisa ser nível 100.')
            if (nome === 'reibugs' && (user.bugPower || 0) < 1000) return reply('❌ Requisito não atingido: Você precisa de 1000 Bug Power.')
            if (nome === 'singularidade' && (user.wins || 0) < 100) return reply('❌ Requisito não atingido: Você precisa de 100 vitórias em duelos.')
            if (nome === 'pecado_ira') {
                if (user.level < 60) return reply('❌ Requisito não atingido: Você precisa ser nível 60.')
                if ((user.bossesMortos || 0) < 30) return reply('❌ Requisito não atingido: Você precisa derrotar 30 Bosses.')
            }
            if (nome === 'meliodas_assault') {
                if (user.level < 80) return reply('❌ Requisito não atingido: Você precisa ser nível 80.')
                if ((user.bossesMortos || 0) < 100) return reply('❌ Requisito não atingido: Você precisa derrotar 100 Bosses.')
                if ((user.wins || 0) < 50) return reply('❌ Requisito não atingido: Você precisa de 50 vitórias em duelos.')
            }

            if (lendariaEscolhida.loots && lendariaEscolhida.loots.length > 0) {
                const inventario = user.inventario || []
                const faltando = lendariaEscolhida.loots.filter(item => !inventario.includes(item))

                if (faltando.length > 0) {
                    return reply('❌ *Faltam loots de Boss necessários!*\n\n🔮 Classe: ' + lendariaEscolhida.nome + '\n\n📦 *Loots pendentes:*\n' + faltando.map(i => '• ' + i).join('\n'))
                }

                lendariaEscolhida.loots.forEach(item => {
                    const idx = user.inventario.indexOf(item)
                    if (idx !== -1) user.inventario.splice(idx, 1)
                })
            }

            user.classeLendaria = nome
            if (nome === 'meliodas_assault') {
                user.hpMax = (user.hpMax || 100) + 200
                user.hp = user.hpMax
            }
            await dataService.saveXpData(xpData)
            logger.info('[LENDARIA] User ' + sender + ' desbloqueou classe lendária ' + nome)

            return reply('🌟 *CLASSE LENDÁRIA DESBLOQUEADA!*\n\n🔮 *' + lendariaEscolhida.nome + '*\n✨ *Habilidade Ativa:* ' + lendariaEscolhida.habilidade)
        }

        return reply('❌ Opção inválida. Use: .lendaria lista, .lendaria info [nome] ou .lendaria desbloquear [nome]')
    }
}