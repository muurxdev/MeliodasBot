/**
 * Comando .roubar / .rob
 * Tenta furtar moedas da carteira de outro usuário com risco de indenização/multa
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

module.exports = {
    name: "roubar",
    aliases: ["rob", "assaltar", "furtar", "trombadinha"],
    category: "economy",
    description: "Tente furtar moedas de outro membro (cooldown: 2 horas)",
    groupOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, info, reply, isOwner }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!mentioned) {
            return reply("❌ Marque o usuário que você deseja tentar roubar.\n\n📌 *Exemplo:* \`.roubar @usuario\`")
        }

        if (mentioned === sender) {
            return reply("❌ Você não pode roubar a si mesmo!")
        }

        const victim = initializeUser(mentioned, xpData)
        const victimCoins = victim.coins || 0

        if (victimCoins < 100) {
            return reply("❌ A vítima é muito humilde e tem menos de 100 Coins na carteira. Não vale a pena o risco!")
        }

        const now = Date.now()
        const lastRob = user.lastRob || 0
        const COOLDOWN_ROB = 2 * 60 * 60 * 1000 // 2 horas

        if (now - lastRob < COOLDOWN_ROB && !isOwner) {
            const rem = COOLDOWN_ROB - (now - lastRob)
            const m = Math.floor(rem / 60000)
            const s = Math.floor((rem % 60000) / 1000)
            return reply("🚨 *A polícia ainda está atrás de você!*\n\nAguarde *" + m + "m " + s + "s* para tentar outro furto.")
        }

        user.lastRob = now
        const success = Math.random() < 0.45 // 45% de sucesso

        let doc = "╔══════════════════════════════╗\n"
        doc += "║    🦹 *TENTATIVA DE ROUBO* 🦹    ║\n"
        doc += "╚══════════════════════════════╝\n\n"

        if (success) {
            // Rouba entre 10% e 25% das moedas da carteira da vítima
            const percent = (Math.floor(Math.random() * 15) + 10) / 100
            const stolenAmount = Math.max(50, Math.floor(victimCoins * percent))

            victim.coins = Math.max(0, (victim.coins || 0) - stolenAmount)
            user.coins = (user.coins || 0) + stolenAmount
            user.roubosSucesso = (user.roubosSucesso || 0) + 1

            doc += `🎭 *FURTO REALIZADO COM SUCESSO!*\n`
            doc += `🦹 *Ladrão:* @${sender.split('@')[0]}\n`
            doc += `🎯 *Vítima:* @${mentioned.split('@')[0]}\n\n`
            doc += `╭━〔 💰 BOTIM 〕━⬣\n`
            doc += `┃ 💵 *Valor Furtado:* +${stolenAmount.toLocaleString('pt-BR')} Coins (${Math.round(percent * 100)}%)\n`
            doc += `┃ 💰 *Seu Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
        } else {
            // Pego em flagrante: Paga indenização para a vítima
            const fine = Math.min(user.coins || 0, Math.floor(Math.random() * 350) + 200)

            user.coins = Math.max(0, (user.coins || 0) - fine)
            victim.coins = (victim.coins || 0) + fine

            doc += `👮 *VOCÊ FOI PEGO EM FLAGRANTE!*\n`
            doc += `🦹 *Infrator:* @${sender.split('@')[0]}\n`
            doc += `🛡️ *Vítima Protegida:* @${mentioned.split('@')[0]}\n\n`
            doc += `╭━〔 ⚖️ INDENIZAÇÃO 〕━⬣\n`
            doc += `┃ 💸 *Valor Pago à Vítima:* -${fine.toLocaleString('pt-BR')} Coins\n`
            doc += `┃ 💰 *Seu Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
        }

        await dataService.saveXpData(xpData)
        doc += `\n👑 *${botName}*`
        return reply(doc.trim(), [sender, mentioned])
    }
}
