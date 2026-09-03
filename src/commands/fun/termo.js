const logger = require('../../core/logger')

const PALAVRAS = [
    'AMIGO', 'BRUXO', 'CAVALO', 'DADOS', 'ESCOLA',
    'FELIZ', 'GRAOS', 'HONRA', 'ILHAS', 'JOGOS',
    'LEITE', 'MUSGO', 'NOBRE', 'OLHOS', 'PRAIA',
    'QUASE', 'RUBRO', 'SALTO', 'TELAS', 'UNIDA',
    'VELHO', 'XADREZ', 'ZEBRA', 'AMOR', 'BOMBA',
    'CORPO', 'DEUS', 'FLOR', 'GATO', 'MESA'
]

const activeGames = new Map()
const TTL_MS = 5 * 60 * 1000

function cleanupExpired() {
    const now = Date.now()
    for (const [key, game] of activeGames) {
        if (now - game.createdAt > TTL_MS) activeGames.delete(key)
    }
}

module.exports = {
    name: 'termo',
    aliases: ['wordle', 'jogotermo', 'adivinharpalavra'],
    category: 'fun',
    subcategory: 'Jogos',
    description: 'Jogo estilo Wordle — adivinhe a palavra de 5 letras em 6 tentativas',
    cooldownMs: 2000,
    execute: async ({ from, sender, reply, args }) => {
        cleanupExpired()
        const key = `${from}_${sender}`
        const game = activeGames.get(key)
        const chute = (args[0] || '').toUpperCase().trim()

        if (!game) {
            const secret = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)]
            activeGames.set(key, { secret, attempts: [], maxAttempts: 6, createdAt: Date.now() })
            return reply(
                `🟩 *TERMO — JOGO INICIADO*\n\n` +
                `🔒 A palavra secreta tem *5 letras*.\n` +
                `📋 Você tem *6 tentativas* para adivinhar.\n\n` +
                `💡 Feedback:\n` +
                `🟩 = Letra certa, posição correta\n` +
                `🟨 = Letra existe, posição errada\n` +
                `⬛ = Letra não existe\n\n` +
                `👉 Envie \`.termo <palavra>\` para jogar!`
            )
        }

        if (!chute || chute.length !== 5) {
            return reply(`❌ Seu palpite deve ter exatamente *5 letras*! (ex: \`.termo AMIGO\`)`)
        }

        let feedback = ''
        for (let i = 0; i < 5; i++) {
            if (chute[i] === game.secret[i]) {
                feedback += '🟩'
            } else if (game.secret.includes(chute[i])) {
                feedback += '🟨'
            } else {
                feedback += '⬛'
            }
        }

        game.attempts.push({ chute, feedback })

        if (chute === game.secret) {
            activeGames.delete(key)
            return reply(
                `🎉 *PARABÉNS! VOCÊ ACERTOU!*\n\n` +
                `👑 *Palavra:* \`${game.secret}\`\n` +
                `📊 *Tentativas:* ${game.attempts.length}/${game.maxAttempts}\n\n` +
                `${game.attempts.map((a, i) => `${i + 1}. \`${a.chute}\` ${a.feedback}`).join('\n')}`
            )
        }

        if (game.attempts.length >= game.maxAttempts) {
            const revelada = game.secret
            activeGames.delete(key)
            return reply(
                `❌ *FIM DE JOGO!*\n\n` +
                `📖 A palavra era: \`${revelada}\`\n\n` +
                `${game.attempts.map((a, i) => `${i + 1}. \`${a.chute}\` ${a.feedback}`).join('\n')}`
            )
        }

        const tentativas = game.attempts.map((a, i) =>
            `${i + 1}. \`${a.chute}\` ${a.feedback}`
        ).join('\n')

        return reply(
            `🧩 *TERMO — TENTATIVA ${game.attempts.length}/6*\n\n` +
            `${tentativas}\n\n` +
            `👉 Envie \`.termo <palavra>\` para a próxima tentativa!`
        )
    }
}
