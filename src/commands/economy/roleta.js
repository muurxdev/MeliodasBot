/**
 * Comando .roleta
 * Roleta Clássica de Cassino com Probabilidade Matemática Justa e Multiplicadores Reais
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

module.exports = {
    name: "roleta",
    aliases: ["roulette", "roletacassino", "apostar-roleta"],
    category: "economy",
    description: "Aposte suas moedas na Roleta Europeia (0-36, Vermelho, Preto ou Verde)",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        if (!args[0] || !args[1]) {
            let help = "╔══════════════════════════════╗\n"
            help += "║    🎰 *ROLETA DO CASSINO* 🎰    ║\n"
            help += "╚══════════════════════════════╝\n\n"
            help += "📌 *Como Jogar:* \`.roleta <valor> <aposta>\`\n\n"
            help += "╭━〔 🎲 TIPOS DE APOSTAS 〕━⬣\n"
            help += "┃ 🔴 *vermelho* (2x) — Paga o dobro da aposta\n"
            help += "┃ ⚫ *preto* (2x) — Paga o dobro da aposta\n"
            help += "┃ 🟢 *verde* / *0* (14x) — Paga 14x o valor\n"
            help += "┃ 🔢 *Número (1 a 36)* (36x) — Paga 36x o valor\n"
            help += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
            help += "📝 *Exemplos:*\n"
            help += "👉 \`.roleta 500 vermelho\`\n"
            help += "👉 \`.roleta 200 7\` (Aposta no número 7)\n"
            help += "👉 \`.roleta 100 verde\`\n\n"
            help += "💰 *Seu Saldo Atual:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins"
            return reply(help.trim())
        }

        const betAmount = parseInt(args[0], 10)
        if (isNaN(betAmount) || betAmount <= 0) {
            return reply("❌ O valor da aposta deve ser um número inteiro positivo maior que zero.")
        }

        const maxBet = 500000
        if (betAmount > maxBet) {
            return reply("❌ O limite máximo por aposta na roleta é de " + maxBet.toLocaleString("pt-BR") + " Coins.")
        }

        if ((user.coins || 0) < betAmount) {
            return reply("❌ *Saldo insuficiente!* Você possui *" + (user.coins || 0).toLocaleString("pt-BR") + " Coins* e tentou apostar *" + betAmount.toLocaleString("pt-BR") + " Coins*.")
        }

        const choiceRaw = args[1].toLowerCase().trim()
        let betType = ""
        let chosenNumber = null

        if (choiceRaw === "vermelho" || choiceRaw === "red" || choiceRaw === "v") {
            betType = "vermelho"
        } else if (choiceRaw === "preto" || choiceRaw === "black" || choiceRaw === "p") {
            betType = "preto"
        } else if (choiceRaw === "verde" || choiceRaw === "green" || choiceRaw === "zero" || choiceRaw === "0") {
            betType = "verde"
            chosenNumber = 0
        } else {
            const num = parseInt(choiceRaw, 10)
            if (!isNaN(num) && num >= 0 && num <= 36) {
                betType = num === 0 ? "verde" : "numero"
                chosenNumber = num
            } else {
                return reply("❌ Opção de aposta inválida! Escolha: *vermelho*, *preto*, *verde* ou um número de *0 a 36*.")
            }
        }

        // Sorteio justo da Roleta Europeia (0 a 36)
        const drawnNumber = Math.floor(Math.random() * 37)
        let drawnColor = "🟢 Verde"
        if (RED_NUMBERS.includes(drawnNumber)) drawnColor = "🔴 Vermelho"
        else if (BLACK_NUMBERS.includes(drawnNumber)) drawnColor = "⚫ Preto"

        let won = false
        let multiplier = 0

        if (betType === "vermelho" && RED_NUMBERS.includes(drawnNumber)) {
            won = true
            multiplier = 2
        } else if (betType === "preto" && BLACK_NUMBERS.includes(drawnNumber)) {
            won = true
            multiplier = 2
        } else if (betType === "verde" && drawnNumber === 0) {
            won = true
            multiplier = 14
        } else if (betType === "numero" && drawnNumber === chosenNumber) {
            won = true
            multiplier = 36
        }

        let profit = 0
        if (won) {
            profit = (betAmount * multiplier) - betAmount
            user.coins = (user.coins || 0) + profit
        } else {
            user.coins = Math.max(0, (user.coins || 0) - betAmount)
        }

        await dataService.saveXpData(xpData)
        logger.info("[ROLETA] " + sender + " apostou " + betAmount + " em " + betType + " e " + (won ? "VENCEU +" + profit : "PERDEU"))

        let resDoc = "╔══════════════════════════════╗\n"
        resDoc += "║   🎰 *RESULTADO DA ROLETA* 🎰   ║\n"
        resDoc += "╚══════════════════════════════╝\n\n"
        resDoc += "🎡 *A roleta girou e parou no:*\n"
        resDoc += "➡️ 🎯 *" + drawnNumber + " (" + drawnColor + ")* ⬅️\n\n"
        resDoc += "╭━〔 📋 DADOS DA APOSTA 〕━⬣\n"
        resDoc += "┃ 👤 *Apostador:* @" + sender.split("@")[0] + "\n"
        resDoc += "┃ 💰 *Valor Apostado:* " + betAmount.toLocaleString("pt-BR") + " Coins\n"
        resDoc += "┃ 🎯 *Sua Escolha:* " + (chosenNumber !== null ? "Número " + chosenNumber : betType.toUpperCase()) + "\n"
        resDoc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"

        if (won) {
            resDoc += `🎉 *VITÓRIA INCRÍVEL!*\n`
            resDoc += `⭐ *Multiplicador:* ${multiplier}x\n`
            resDoc += `💵 *Lucro Líquido:* +${profit.toLocaleString('pt-BR')} Coins\n`
            resDoc += `💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n\n`
            resDoc += `🏆 _A sorte esteve ao seu lado!_`
        } else {
            resDoc += `💀 *VOCÊ PERDEU!*\n`
            resDoc += `💸 *Prejuízo:* -${betAmount.toLocaleString('pt-BR')} Coins\n`
            resDoc += `💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n\n`
            resDoc += `💡 _Mais sorte na próxima rodada!_`
        }

        resDoc += `\n\n👑 *${botName}*`
        return reply(resDoc.trim(), [sender])
    }
}
