/**
 * Comando .charada — enigma com RESPOSTA LIVRE (responda no chat), via
 * interactionService. Premia XP/coins ao acertar.
 */
const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const interactionService = require('../../services/interactionService')

const CHARADAS = [
    { q: 'O que tem cabeça e cauda mas não tem corpo?', a: 'MOEDA' },
    { q: 'Quanto mais se tira, maior fica. O que é?', a: 'BURACO' },
    { q: 'O que é, o que é: fala sem boca e ouve sem ouvido?', a: 'ECO' },
    { q: 'Tem dentes mas não morde. O que é?', a: 'PENTE' },
    { q: 'O que sobe mas nunca desce?', a: 'IDADE' },
    { q: 'Qual estrutura de dados funciona como uma fila do banco (FIFO)?', a: 'FILA' },
    { q: 'Linguagem de marcação usada para páginas web (sigla)?', a: 'HTML' },
    { q: 'O que é cheio de furos mas ainda segura água?', a: 'ESPONJA' },
    { q: 'Base numérica dos computadores (2 dígitos)?', a: 'BINARIO' },
    { q: 'Ando com a cabeça pra baixo, tenho corpo de metal. Sou o...', a: 'PREGO' }
]

const norm = (s) => (s || '').toUpperCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')

module.exports = {
    name: 'charada',
    aliases: ['enigma', 'adivinha', 'charadas'],
    category: 'fun',
    subcategory: 'Quiz',
    description: 'Uma charada/enigma — responda no chat para ganhar XP e coins',
    cooldownMs: 3000,
    execute: async ({ from, sender, reply }) => {
        const c = CHARADAS[Math.floor(Math.random() * CHARADAS.length)]
        interactionService.register(from, {
            type: 'charada',
            ttlMs: 120000,
            onText: async (text, ctx) => {
                const val = norm(text)
                if (val.length < 2) return false
                if (val === norm(c.a) || norm(c.a).includes(val) && val.length >= 4) {
                    ctx.clear()
                    const xpData = dataService.getXpData()
                    const u = initializeUser(ctx.userJid || sender, xpData)
                    u.xp = (u.xp || 0) + 150; u.coins = (u.coins || 0) + 100
                    dataService.saveUser(u)
                    await ctx.reply(`🎉 *ACERTOU!* A resposta era *${c.a}*.\n⭐ +150 XP e +100 Coins!`)
                    return true
                }
                return false // deixa outros palpites/chat passarem
            }
        })
        return reply(`🧩 *CHARADA*\n\n❓ ${c.q}\n\n👉 _Responda no chat!_`)
    }
}
