/**
 * Comando .trabalhar / .work
 * Trabalha honestamente para ganhar Coins e XP com cooldown
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const TRABALHOS = [
    { cargo: "Desenvolvedor Full Stack", desc: "Criou uma API escalável e corrigiu memory leaks." },
    { cargo: "Caçador de Recompensas", desc: "Capturou foragidos perigosos nas colinas do reino." },
    { cargo: "Mestre Cervejeiro", desc: "Produziu um barril lendário na Taverna Chapéu de Javali." },
    { cargo: "Engenheiro de DevOps", desc: "Manteve o cluster Kubernetes 100% online sem quedas." },
    { cargo: "Guarda Real", desc: "Fez a patrulha noturna protegendo os portões de Liones." },
    { cargo: "Hacker Ético", desc: "Descobriu e reportou uma vulnerabilidade crítica de dia zero." },
    { cargo: "Minerador de Cripto", desc: "Configurou uma rig de mineração super-eficiente." },
    { cargo: "Alquimista", desc: "Destilou frascos raros de elixir para os aventureiros." }
]

module.exports = {
    name: "trabalhar",
    aliases: ["work", "trampo", "trampar", "job"],
    category: "economy",
    description: "Trabalhe honestamente para ganhar Coins e XP (cooldown: 45 min)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const now = Date.now()
        const lastWork = user.lastWork || 0
        const COOLDOWN_WORK = 45 * 60 * 1000 // 45 minutos

        if (now - lastWork < COOLDOWN_WORK) {
            const rem = COOLDOWN_WORK - (now - lastWork)
            const m = Math.floor(rem / 60000)
            const s = Math.floor((rem % 60000) / 1000)
            return reply("😴 *Você está cansado!* Descanse um pouco antes de trabalhar novamente.\n\n🕒 Volte em *" + m + "m " + s + "s*.")
        }

        const job = TRABALHOS[Math.floor(Math.random() * TRABALHOS.length)]
        const level = user.level || 1

        const coinsEarned = Math.floor(Math.random() * 250) + 200 + (level * 10)
        const xpEarned = Math.floor(Math.random() * 40) + 40 + (level * 5)

        user.lastWork = now
        user.coins = (user.coins || 0) + coinsEarned
        user.xp = (user.xp || 0) + xpEarned
        user.trabalhosRealizados = (user.trabalhosRealizados || 0) + 1

        await dataService.saveXpData(xpData)
        logger.info("[WORK] " + sender + " trabalhou como " + job.cargo + " (+" + coinsEarned + " coins)")

        let doc = "╔══════════════════════════════╗\n"
        doc += "║    💼 *JORNADA DE TRABALHO* 💼   ║\n"
        doc += "╚══════════════════════════════╝\n\n"
        doc += "👷 *Profissão:* *" + job.cargo + "*\n"
        doc += "📝 *Atividade:* _" + job.desc + "_\n\n"
        doc += "╭━〔 💰 SALÁRIO RECEBIDO 〕━⬣\n"
        doc += "┃ 💵 *Ganhos:* +" + coinsEarned.toLocaleString("pt-BR") + " Coins\n"
        doc += "┃ ⭐ *XP Ganho:* +" + xpEarned.toLocaleString("pt-BR") + " XP\n"
        doc += "┃ 💰 *Saldo Atual:* " + (user.coins || 0).toLocaleString("pt-BR") + " Coins\n"
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n"
        doc += "👑 *" + botName + "*"

        return reply(doc.trim(), [sender])
    }
}
