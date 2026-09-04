/**
 * Comando .numeroaleatorio — sorteia um número inteiro num intervalo.
 * Uso: .numeroaleatorio [min] [max]  (padrão 1-100)
 */
module.exports = {
    name: 'numeroaleatorio',
    aliases: ['aleatorio', 'random', 'sortearnumero', 'rng'],
    category: 'general',
    subcategory: 'Utilidades',
    description: 'Sorteia um número inteiro num intervalo (ex.: .numeroaleatorio 1 6)',
    cooldownMs: 1500,
    execute: async ({ args, reply }) => {
        let min = parseInt(args[0], 10)
        let max = parseInt(args[1], 10)
        if (isNaN(min) && isNaN(max)) { min = 1; max = 100 }
        else if (isNaN(max)) { max = min; min = 1 }
        if (isNaN(min) || isNaN(max)) return reply('🎲 *Aleatório* — Uso: `.numeroaleatorio [min] [max]`')
        if (min > max) [min, max] = [max, min]
        const n = Math.floor(Math.random() * (max - min + 1)) + min
        return reply(`🎲 Número sorteado entre *${min}* e *${max}*:\n\n➡️ *${n}*`)
    }
}
