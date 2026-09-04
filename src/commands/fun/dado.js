/**
 * Comando .dado — rola dados no formato NdM (ex.: 2d6). Sem aposta (isso é .dadoaposta).
 */
module.exports = {
    name: 'dado',
    aliases: ['rolar', 'roll', 'dados', 'd6', 'd20'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Rola dados no formato NdM (ex.: .dado 2d6, .dado d20, .dado)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        let spec = (args[0] || '1d6').toLowerCase().replace(/\s/g, '')
        const m = spec.match(/^(\d*)d(\d+)$/)
        if (!m) return reply('🎲 *Dado* — Uso: `.dado 2d6` (2 dados de 6 faces) ou `.dado d20`.')
        const n = Math.min(parseInt(m[1] || '1', 10) || 1, 20)
        const faces = Math.min(parseInt(m[2], 10), 1000)
        if (faces < 2) return reply('❌ O dado precisa de pelo menos 2 faces.')
        const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * faces) + 1)
        const soma = rolls.reduce((a, b) => a + b, 0)
        return reply(`🎲 *${n}d${faces}*\n\n🎯 Resultados: ${rolls.map(r => `*${r}*`).join(' + ')}\n➕ *Total:* ${soma}`)
    }
}
