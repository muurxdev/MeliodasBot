const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { formatCoins } = require('../../utils/uiEngine')
const logger = require('../../core/logger')

const GUILD_ITEMS = {
    'espada guilda': { nome: '⚔️ Espada da Guilda', preco: 100, tipo: 'arma', bonus: '+15 Ataque', effect: 'atk' },
    'armadura guilda': { nome: '🛡️ Armadura da Guilda', preco: 150, tipo: 'armadura', bonus: '+15 Defesa', effect: 'def' },
    'pocao guilda': { nome: '🧪 Poção da Guilda', preco: 50, tipo: 'consumivel', bonus: 'Cura 50 HP', effect: 'heal' }
}

module.exports = {
    name: 'lojaguilda',
    aliases: ['guildshop', 'shopguilda', 'lojaclã'],
    category: 'rpg',
    subcategory: 'Economia',
    description: 'Loja exclusiva da guilda — compre itens com guild coins',
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const sub = (args[0] || '').toLowerCase()

        if (!sub || sub === 'loja' || sub === 'lista') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   🏪 *LOJA DA GUILDA* 🏪   ║\n'
            doc += '╚══════════════════════════════╝\n\n'

            if (!user.guilda) {
                doc += '❌ *Você não pertence a nenhuma guilda!*\n💡 _Crie uma com_ \`.guerraguilda criar <nome>\`'
                return reply(doc.trim(), [sender])
            }

            doc += `🏰 *Guilda:* ${user.guilda}\n`
            doc += `💰 *Guild Coins:* ${user.guildCoins || 0} gc\n\n`

            doc += '╭━〔 🛒 ITENS DISPONÍVEIS 〕━⬣\n'
            Object.entries(GUILD_ITEMS).forEach(([key, item]) => {
                doc += `┃ ${item.nome}\n`
                doc += `┃ 💰 *Preço:* ${item.preco} gc\n`
                doc += `┃ ✨ *Bônus:* ${item.bonus}\n`
                doc += `┃ 🆔 *ID:* ${key}\n`
                doc += `┃ ─────────────────\n`
            })
            doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
            doc += '💡 _Use_ \`.lojaguilda comprar <item>\` _para comprar!_'

            return reply(doc.trim(), [sender])
        }

        if (sub === 'comprar' || sub === 'buy') {
            if (!user.guilda) return reply('❌ Você não pertence a nenhuma guilda!')

            const itemName = args.slice(1).join(' ').toLowerCase()

            if (!itemName || !GUILD_ITEMS[itemName]) {
                return reply('❌ Item inválido! Itens: espada guilda, armadura guilda, pocao guilda\nEx: `.lojaguilda comprar espada guilda`')
            }

            const item = GUILD_ITEMS[itemName]
            const guildCoins = user.guildCoins || 0

            if (guildCoins < item.preco) {
                return reply(`❌ Guild Coins insuficientes!\n\n💰 *Seus GC:* ${guildCoins} gc\n🏷️ *Preço:* ${item.preco} gc\n💡 _Ganhe GC em batalhas de guilda!_`)
            }

            user.guildCoins = guildCoins - item.preco

            if (item.tipo === 'consumivel') {
                const maxHp = user.rpgHpMax || user.hpMax || 100
                user.rpgHp = Math.min(maxHp, (user.rpgHp || user.hp || 100) + 50)
                user.hp = user.rpgHp
            } else {
                if (!user.inventario) user.inventario = []
                user.inventario.push(item.nome)
            }

            await dataService.saveXpData(xpData)
            logger.info(`[LOJAGUILDA] ${sender} comprou ${itemName} da guilda`)

            let doc = '🎉 *COMPRA REALIZADA!*\n\n'
            doc += `${item.nome}\n`
            doc += `✨ *Bônus:* ${item.bonus}\n`
            doc += `💰 *GC Pago:* ${item.preco} gc\n`
            doc += `💰 *GC Restantes:* ${user.guildCoins || 0} gc\n\n`

            if (item.tipo === 'consumivel') {
                doc += `💚 *HP Curado!* HP Atual: ${user.rpgHp || user.hp || 100}`
            } else {
                doc += `📦 *Adicionado ao inventário!* Use \`.equipar\` para usar.`
            }

            return reply(doc.trim(), [sender])
        }

        if (sub === 'meus' || sub === 'inventario') {
            let doc = '╔══════════════════════════════╗\n'
            doc += '║   📦 *ITENS DA GUILDA* 📦   ║\n'
            doc += '╚══════════════════════════════╝\n\n'
            doc += `🏰 *Guilda:* ${user.guilda || 'Nenhuma'}\n`
            doc += `💰 *Guild Coins:* ${user.guildCoins || 0} gc\n\n`

            const guildItems = (user.inventario || []).filter(i =>
                Object.values(GUILD_ITEMS).some(gi => gi.nome === i)
            )

            if (guildItems.length === 0) {
                doc += '📭 *Nenhum item da guilda no inventário.*\n💡 _Compre na loja com_ \`.lojaguilda\`'
            } else {
                doc += '╭━〔 🎒 SEUS ITENS 〕━⬣\n'
                guildItems.forEach(item => {
                    doc += `┃ ${item}\n`
                })
                doc += '╰━━━━━━━━━━━━━━━━━━⬣'
            }

            return reply(doc.trim(), [sender])
        }

        return reply('❌ Opção inválida! Use:\n• `.lojaguilda` — Ver itens\n• `.lojaguilda comprar <item>` — Comprar item\n• `.lojaguilda meus` — Ver seus itens')
    }
}
