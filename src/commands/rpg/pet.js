const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { petsDisponiveis } = require('../../utils/constants')
const logger = require('../../core/logger')

const precosPets = {
    cachorro: 500,
    gato: 500,
    raposa: 1200,
    lobo: 1500,
    aguia: 1500,
    robo: 2500
}

module.exports = {
    name: 'pet',
    aliases: ['pets', 'mascote'],
    category: 'rpg',
    description: 'Sistema de pets companheiros com bônus de dano, XP e coins',
    execute: async ({ args, sender, reply }) => {
        const acao = args[0] ? args[0].toLowerCase() : ''
        const nomePet = args[1] ? args[1].toLowerCase() : ''

        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!acao || acao === 'loja') {
            let textoLoja = '🐾 *LOJA DE PETS DEV*\n\n'
            Object.entries(petsDisponiveis).forEach(([id, p]) => {
                textoLoja += p.nome + ' (id: ' + id + ')\n💰 Preço: ' + (precosPets[id] || 1000) + ' coins\n✨ Bônus: ' + p.bonus + '\n\n'
            })
            textoLoja += 'Para comprar use: *.pet comprar [id]*\nPara ver seus pets: *.pet meus*\nPara equipar: *.pet equipar [id]*'
            return reply(textoLoja)
        }

        if (acao === 'meus') {
            const meus = user.pets || []
            if (meus.length === 0) return reply('🐾 Você ainda não possui nenhum pet. Adquira um na loja com *.pet loja*')
            return reply('🐾 *SEUS PETS:*\n\n' + meus.map(p => '• ' + (petsDisponiveis[p]?.nome || p)).join('\n') + '\n\n🎒 *Equipado:* ' + (user.pet ? petsDisponiveis[user.pet]?.nome : 'Nenhum'))
        }

        if (acao === 'comprar') {
            if (!nomePet) return reply('❌ Use: .pet comprar [nome]\nExemplo: .pet comprar cachorro')
            if (!petsDisponiveis[nomePet]) return reply('❌ Pet inválido. Use .pet loja.')

            if (!user.pets) user.pets = []
            if (user.pets.includes(nomePet)) return reply('❌ Você já possui este pet.')

            const preco = precosPets[nomePet] || 1000
            if ((user.coins || 0) < preco) return reply('❌ Coins insuficientes.\n\n💰 Seu saldo: ' + (user.coins || 0) + ' coins\n🏷️ Preço: ' + preco + ' coins')

            user.coins -= preco
            user.pets.push(nomePet)
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' comprou pet ' + nomePet)

            return reply('🎉 *PET ADQUIRIDO COM SUCESSO!*\n\n' + petsDisponiveis[nomePet].nome + '\n✨ ' + petsDisponiveis[nomePet].bonus + '\n\nPara equipar use:\n*.pet equipar ' + nomePet + '*')
        }

        if (acao === 'equipar') {
            if (!nomePet) return reply('❌ Use: .pet equipar [nome]\nExemplo: .pet equipar cachorro')
            if (!user.pets || !user.pets.includes(nomePet)) return reply('❌ Você não possui esse pet. Compre na loja com *.pet loja*')

            user.pet = nomePet
            await dataService.saveXpData(xpData)
            logger.info('[PET] User ' + sender + ' equipou pet ' + nomePet)

            return reply('✅ *PET EQUIPADO COM SUCESSO!*\n\n' + petsDisponiveis[nomePet].nome + '\n✨ ' + petsDisponiveis[nomePet].bonus)
        }

        return reply('❌ Opção inválida. Use: .pet loja, .pet meus, .pet comprar [nome] ou .pet equipar [nome]')
    }
}