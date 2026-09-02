/**
 * MeliodasBot — Comando .caraoucoroa
 * Aposta Rápida 1v1 com probabilidade justa (50/50) e multiplicador 2x
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "caraoucoroa",
    aliases: ["coinflip", "flip", "moeda", "cara-coroa"],
    category: "economy",
    description: "Aposte moedas no cara ou coroa com 50% de chance de dobrar o valor",
    cooldownMs: 2000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!args[0] || !args[1]) {
            let help = "╔══════════════════════════════╗\n"
            help += "║     🪙 *CARA OU COROA* 🪙     ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Jogar:* \`.caraoucoroa <valor> <cara|coroa>\`\n\n"
            help += "📝 *Exemplos:*\n"
            help += "👉 \`.caraoucoroa 500 cara\`\n"
            help += "👉 \`.caraoucoroa 1000 coroa\`\n\n"
            help += "⭐ *Multiplicador:* 2x o valor apostado\n"
            help += "💰 *Seu Saldo:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
            return reply(help.trim())
        }

        const betAmount = parseInt(args[0], 10)
        if (isNaN(betAmount) || betAmount <= 0) {
            return reply("❌ O valor da aposta deve ser um número positivo maior que zero.")
        }

        if ((user.coins || 0) < betAmount) {
            return reply("❌ Saldo insuficiente! Você possui *" + (user.coins || 0).toLocaleString("pt-BR") + " Coins*.")
        }

        const choice = args[1].toLowerCase().trim()
        if (choice !== "cara" && choice !== "coroa") {
            return reply("❌ Escolha inválida. Você deve escolher entre *cara* ou *coroa*.")
        }

        const coinResult = Math.random() < 0.5 ? "cara" : "coroa"
        const won = coinResult === choice

        if (won) {
            user.coins = (user.coins || 0) + betAmount
        } else {
            user.coins = Math.max(0, (user.coins || 0) - betAmount)
        }

        await dataService.saveXpData(xpData)
        logger.info("[COINFLIP] " + sender + " apostou " + betAmount + " em " + choice + " e deu " + coinResult)

        let doc = "╔══════════════════════════════╗\n"
        doc += "║     🪙 *CARA OU COROA* 🪙     ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += "🪙 *A moeda foi lançada ao ar...*\n"
        doc += "➡️ 🎯 *Resultado:* *" + coinResult.toUpperCase() + "* ⬅️\n\n"
        doc += "╭━〔 📋 DETALHES DA APOSTA 〕━⬣\n"
        doc += "┃ 👤 *Apostador:* @" + sender.split("@")[0] + "\n"
        doc += "┃ 🎯 *Sua Escolha:* " + choice.toUpperCase() + "\n"
        doc += "┃ 💰 *Valor da Aposta:* " + betAmount.toLocaleString("pt-BR") + " Coins\n"
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"

        if (won) {
            doc += `🎉 *VOCÊ ACERTOU E DOBROU O VALOR!*\n`
            doc += `💵 *Lucro Líquido:* +${betAmount.toLocaleString('pt-BR')} Coins\n`
            doc += `💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins`
        } else {
            doc += `💀 *VOCÊ ERROU!*\n`
            doc += `💸 *Prejuízo:* -${betAmount.toLocaleString('pt-BR')} Coins\n`
            doc += `💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins`
        }

        doc += `\n\n👑 *${botName}*`
        return reply(doc.trim(), [sender])
    }
}
