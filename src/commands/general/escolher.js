/**
 * Comando .escolher — o bot escolhe uma das opções dadas (separadas por | ou ,).
 */
module.exports = {
    name: 'escolher',
    aliases: ['escolha', 'decidir', 'ououou', 'pick'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'O bot decide por você (ex.: .escolher pizza | hambúrguer | sushi)',
    cooldownMs: 1500,
    execute: async ({ args, text, reply }) => {
        const raw = (text || (args || []).join(' ')).trim()
        if (!raw) return reply('🎯 *Escolher* — Uso: `.escolher opção1 | opção2 | opção3`')
        const opcoes = raw.split(/\||,| ou /i).map(s => s.trim()).filter(Boolean)
        if (opcoes.length < 2) return reply('❌ Dê pelo menos *2 opções* separadas por `|`, `,` ou `ou`.')
        const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)]
        return reply(`🎯 *Eu escolho:* *${escolhida}*\n\n_(entre ${opcoes.length} opções)_`)
    }
}
