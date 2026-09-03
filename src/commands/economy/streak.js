const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const COOLDOWN_24H = 24 * 60 * 60 * 1000
const MAX_STREAK_REWARD = 1000

module.exports = {
    name: "streak",
    aliases: ["sequencia", "dias", "streakdiario", "chain"],
    category: "economy",
    subcategory: "Diário",
    description: "Mantenha sua sequência de dias e ganhe recompensas!",
    cooldownMs: 86400000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)
        const subcommand = (args[0] || "").toLowerCase()
        const now = Date.now()

        const lastStreak = user.lastStreak || 0
        const currentStreak = user.streak || 0

        const diasDesdeUltimo = lastStreak > 0 ? Math.floor((now - lastStreak) / COOLDOWN_24H) : 0

        if (subcommand === "claim" || subcommand === "coletar" || subcommand === "resgatar") {
            if (lastStreak > 0 && (now - lastStreak) < COOLDOWN_24H) {
                const horasRestantes = Math.ceil((COOLDOWN_24H - (now - lastStreak)) / (60 * 60 * 1000))
                return reply(`⏳ Você já coletou sua recompensa hoje! Volte em *${horasRestantes}h*.`)
            }

            if (lastStreak > 0 && diasDesdeUltimo === 1) {
                user.streak = currentStreak + 1
            } else if (lastStreak > 0 && diasDesdeUltimo > 1) {
                user.streak = 1
            } else {
                user.streak = Math.max(1, currentStreak)
            }

            const streak = user.streak
            const reward = Math.min(100 * streak, MAX_STREAK_REWARD)

            user.coins = (user.coins || 0) + reward
            user.lastStreak = now

            if (!user.transactionHistory) user.transactionHistory = []
            user.transactionHistory.push({
                type: "streak_claim",
                amount: reward,
                streak: streak,
                timestamp: now
            })
            if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

            await dataService.saveXpData(xpData)
            logger.info(`[STREAK] ${sender} claim streak ${streak}, reward ${reward}`)

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   🔥 *STREAK DIÁRIO* 🔥   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += `🔥 *Seu Streak:* ${streak} dias\n`
            doc += `💰 *Recompensa:* +${formatCoins(reward)}\n`
            doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}\n\n`

            if (streak >= 10) {
                doc += `👑 *Lenda! Streak de ${streak} dias!*\n`
            } else if (streak >= 5) {
                doc += `⭐ *Incrível! ${streak} dias seguidos!*\n`
            } else {
                doc += `📈 Continue amanhã para ganhar ${formatCoins(Math.min(100 * (streak + 1), MAX_STREAK_REWARD))}!\n`
            }

            doc += `⏳ Próxima coleta em 24h`

            return reply(doc.trim())
        }

        let doc = "╔══════════════════════════════╗\n"
        doc += "║   🔥 *STREAK DIÁRIO* 🔥   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `🔥 *Streak Atual:* ${currentStreak} dias\n`

        if (lastStreak > 0) {
            const horasRestantes = Math.ceil((COOLDOWN_24H - (now - lastStreak)) / (60 * 60 * 1000))
            if (horasRestantes > 0) {
                doc += `⏳ *Próxima coleta em:* ${horasRestantes}h\n`
            } else {
                doc += `✅ *Recompensa disponível!*\n`
                doc += `📌 Use \`.streak claim\` para coletar\n`
            }
        } else {
            doc += `📌 Use \`.streak claim\` para começar seu streak!\n`
        }

        doc += `\n📊 *Tabela de Recompensas:*\n`
        doc += `• 1 dia = ${formatCoins(100)}\n`
        doc += `• 5 dias = ${formatCoins(500)}\n`
        doc += `• 10 dias = ${formatCoins(1000)} (máximo)\n\n`
        doc += `⚠️ *Atenção:* Se perder 1 dia, o streak reseta!\n`
        doc += `🪙 *Saldo Atual:* ${formatCoins(user.coins || 0)}`

        return reply(doc.trim())
    }
}
