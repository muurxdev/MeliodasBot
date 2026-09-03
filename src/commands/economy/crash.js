const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const activeGames = new Map()

module.exports = {
    name: "crash",
    aliases: ["crashgame", "explodir"],
    category: "economy",
    subcategory: "Jogos",
    description: "Aposte no jogo crash! Multiplique seus coins antes de explodir",
    cooldownMs: 30000,
    execute: async ({ sender, args, text, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const subcommand = (args[0] || "").toLowerCase()

        if (subcommand === "cashout" || subcommand === "sacar") {
            const game = activeGames.get(sender)
            if (!game) {
                return reply("❌ Você não tem nenhum jogo crash ativo!")
            }

            activeGames.delete(sender)
            const winnings = Math.floor(game.bet * game.multiplier)
            user.coins = (user.coins || 0) + winnings

            if (!user.transactionHistory) user.transactionHistory = []
            user.transactionHistory.push({
                type: "crash_cashout",
                amount: winnings,
                multiplier: game.multiplier.toFixed(2),
                timestamp: Date.now()
            })
            if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

            await dataService.saveXpData(xpData)
            logger.info(`[CRASH] ${sender} cashout em ${game.multiplier.toFixed(2)}x, ganhou ${winnings}`)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║     🚀 *CRASH - CASHOUT* 🚀     ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += `📈 *Multiplicador:* ${game.multiplier.toFixed(2)}x\n`
            doc += `💵 *Aposta:* ${formatCoins(game.bet)}\n`
            doc += `💰 *Ganho:* +${formatCoins(winnings)}\n`
            doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}`

            return reply(doc.trim())
        }

        if (subcommand === "status" || subcommand === "") {
            if (subcommand === "" && !args[0]) {
                const game = activeGames.get(sender)
                if (game) {
                    let doc = "╔══════════════════════════════╗\n"
                    doc += "║     🚀 *CRASH - EM ANDAMENTO* 🚀     ║\n"
                    doc += "╚══════════════════════════════╝\n\n"
                    doc += `📈 *Multiplicador Atual:* ${game.multiplier.toFixed(2)}x\n`
                    doc += `💵 *Aposta:* ${formatCoins(game.bet)}\n`
                    doc += `💰 *Possível Ganho:* ${formatCoins(Math.floor(game.bet * game.multiplier))}\n\n`
                    doc += `💡 Digite *.crash cashout* para sacar!`
                    return reply(doc.trim())
                }
            }

            let help = "╔══════════════════════════════╗\n"
            help += "║     🚀 *CRASH GAME* 🚀     ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Jogar:*\n"
            help += "• \`.crash <valor>\` — Iniciar jogo\n"
            help += "• \`.crash cashout\` — Sacar antes de explodir\n\n"
            help += "📊 *Regras:*\n"
            help += "• Multiplicador começa em 1.00x\n"
            help += "• Cresce aleatoriamente a cada tick\n"
            help += "• Se explodir antes do cashout, perde tudo\n\n"
            help += `💰 *Seu Saldo:* ${formatCoins(user.coins || 0)}`
            return reply(help.trim())
        }

        const betAmount = parseInt(subcommand, 10)
        if (isNaN(betAmount) || betAmount < 10) {
            return reply("❌ Valor mínimo de aposta: 10 Coins.\n📌 Uso: `.crash <valor>`")
        }

        if ((user.coins || 0) < betAmount) {
            return reply(`❌ Saldo insuficiente! Você possui ${formatCoins(user.coins || 0)}.`)
        }

        if (activeGames.get(sender)) {
            return reply("❌ Você já tem um jogo crash ativo! Use `.crash cashout` para sacar.")
        }

        user.coins = (user.coins || 0) - betAmount

        const crashPoint = generateCrashPoint()

        const game = {
            bet: betAmount,
            multiplier: 1.00,
            crashPoint: crashPoint,
            startTime: Date.now()
        }
        activeGames.set(sender, game)

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "crash_bet",
            amount: -betAmount,
            timestamp: Date.now()
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║     🚀 *CRASH GAME* 🚀     ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `💵 *Aposta:* ${formatCoins(betAmount)}\n`
        doc += `📈 *Multiplicador Inicial:* 1.00x\n`
        doc += `🔥 *Possível Ganho:* ${formatCoins(betAmount)}\n\n`
        doc += `⏳ *O jogo começou!*\n`
        doc += `💡 Digite *.crash cashout* para sacar a qualquer momento!\n`
        doc += `⚠️ Se explodir antes, você perde tudo!\n\n`
        doc += `🪙 *Saldo Restante:* ${formatCoins(user.coins)}`

        return reply(doc.trim())

        function generateCrashPoint() {
            const e = 2 ** 32
            const h = Math.floor(Math.random() * e)
            if (h % 33 === 0) return 1.00
            return Math.max(1.00, Math.floor((100 * e - h) / (e - h)) / 100)
        }
    }
}
