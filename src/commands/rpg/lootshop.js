const { equipamentos } = require('../../utils/constants')

module.exports = {
    name: 'lootshop',
    aliases: ['equipshop', 'forjaloja'],
    category: 'rpg',
    description: 'Lista todos os equipamentos que podem ser forjados (.craft)',
    execute: async ({ reply }) => {
        let textoEquip = '🛠️ *LOJA DE EQUIPAMENTOS & FORJA*\n\nPara criar um equipamento, use:\n*.craft fazer [nome]*\n\n'
        Object.entries(equipamentos).forEach(([id, eq]) => {
            textoEquip += '🗡️ *' + eq.nome + '*\n🆔 *ID:* ' + id + '\n🎒 *Tipo:* ' + eq.tipo + '\n✨ *Bônus:* ' + eq.bonus + '\n📦 *Receita:*\n' + Object.entries(eq.receita).map(([item, qtd]) => '  • ' + qtd + 'x ' + item).join('\n') + '\n\n'
        })
        await reply(textoEquip)
    }
}