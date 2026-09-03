const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { formatCoins } = require("../../utils/uiEngine")
const logger = require("../../core/logger")

const COOLDOWN_24H = 24 * 60 * 60 * 1000
const DAILY_RATE = 0.02

module.exports = {
    name: "rendafixa",
    aliases: ["rendimento", "rendfixo", "investirrendimento"],
    category: "economy",
    subcategory: "Investimentos",
    description: "Rendimento automático do saldo: 2% ao dia",
    cooldownMs: 86400000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const now = Date.now()
        const lastRenda = user.lastRenda || 0

        if (!args[0]) {
            const saldo = user.coins || 0
            const rendimentoDia = Math.floor(saldo * DAILY_RATE)
            const diasDesdeUltimo = lastRenda > 0 ? Math.floor((now - lastRenda) / (60 * 60 * 1000)) : 0

            let doc = "╔══════════════════════════════╗\n"
            doc += "║   📈 *RENDA FIXA* 📈   ║\n"
            doc += "╚══════════════════════════════╝\n\n"
            doc += `💵 *Saldo Atual:* ${formatCoins(saldo)}\n`
            doc += `📊 *Taxa:* 2% ao dia\n`
            doc += `💰 *Rendimento Diário:* ${formatCoins(rendimentoDia)}\n\n`

            if (lastRenda > 0) {
                const horasRestantes = Math.max(0, Math.ceil((COOLDOWN_24H - (now - lastRenda)) / (60 * 60 * 1000)))
                if (horasRestantes > 0) {
                    doc += `⏳ *Próximo rendimento em:* ${horasRestantes}h\n`
                } else {
                    doc += `✅ *Rendimento disponível!*\n`
                    doc += `📌 Use \`.rendafixa <valor>\` para aplicar\n`
                }
            } else {
                doc += `📌 Use \`.rendafixa <valor>\` para aplicar rendimento\n`
            }

            doc += `\n💡 *Como funciona:*\n`
            doc += `• Aplique seus coins e receba 2% ao dia\n`
            doc += `• Cooldown de 24h entre aplicações\n`
            doc += `• Rendimento é creditado automaticamente`

            return reply(doc.trim())
        }

        const valor = parseInt(args[0], 10)
        if (isNaN(valor) || valor <= 0) {
            return reply("❌ Informe um valor válido.\n📌 Uso: `.rendafixa <valor>`")
        }

        if ((user.coins || 0) < valor) {
            return reply(`❌ Saldo insuficiente! Você possui ${formatCoins(user.coins || 0)}.`)
        }

        if (lastRenda > 0 && (now - lastRenda) < COOLDOWN_24H) {
            const horasRestantes = Math.ceil((COOLDOWN_24H - (now - lastRenda)) / (60 * 60 * 1000))
            return reply(`⏳ Rendimento já aplicado recentemente! Volte em *${horasRestantes}h*.`)
        }

        const rendimento = Math.floor(valor * DAILY_RATE)
        user.coins = (user.coins || 0) - valor + valor + rendimento
        user.lastRenda = now

        if (!user.transactionHistory) user.transactionHistory = []
        user.transactionHistory.push({
            type: "rendafixa",
            amount: rendimento,
            applied: valor,
            timestamp: now
        })
        if (user.transactionHistory.length > 50) user.transactionHistory = user.transactionHistory.slice(-50)

        await dataService.saveXpData(xpData)
        logger.info(`[RENDAFIXA] ${sender} aplicou ${valor}, rendeu ${rendimento}`)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║   📈 *RENDA FIXA APLICADA!* 📈   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += `💵 *Valor Aplicado:* ${formatCoins(valor)}\n`
        doc += `📊 *Taxa:* 2% ao dia\n`
        doc += `💰 *Rendimento Créditado:* +${formatCoins(rendimento)}\n`
        doc += `🪙 *Novo Saldo:* ${formatCoins(user.coins)}\n\n`
        doc += `⏳ *Próximo rendimento:* 24h`

        return reply(doc.trim())
    }
}
