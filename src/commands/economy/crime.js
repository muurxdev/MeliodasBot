/**
 * Comando .crime
 * Cometa crimes arriscados por altas quantias de Coins com risco de prisão/multa
 */

const dataService = require("../../services/dataService")
const { initializeUser } = require("../../services/xpService")
const { getBotName } = require("../../config/botConfig")
const logger = require("../../core/logger")

const CRIMES_SUCESSO = [
    { crime: "Assalto a um Banco Central", desc: "Hackeou os firewalls do cofre e fugiu com malotes de moedas de ouro." },
    { crime: "Contrabando de Artefatos Mágicos", desc: "Negociou relíquias proibidas no mercado negro de Liones." },
    { crime: "Invasão a um Servidor Clandestino", desc: "Desviou uma carteira inteira de Bitcoins sem deixar logs." },
    { crime: "Roubo de Carruagem Real", desc: "Emboscou a caravana de tributos e levou o tesouro da nobreza." }
]

const CRIMES_FALHA = [
    { crime: "Tentativa de Furto em Loja de Poções", desc: "O alarme disparou e a Guarda Real te pegou em flagrante!" },
    { crime: "Invasão de Sistema Governamental", desc: "A inteligência cibernética rastreou seu IP e bloqueou seus fundos!" },
    { crime: "Assalto ao Cassino", desc: "Os seguranças te cercaram na saída e confiscaram seus pertences." }
]

module.exports = {
    name: "crime",
    aliases: ["delito", "assalto", "crime-organizado"],
    category: "economy",
    description: "Cometa crimes de alto risco para faturar muitas moedas (cooldown: 1 hora)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName()
        const xpData = dataService.getXpData()
        const user = initializeUser(sender, xpData)

        const now = Date.now()
        const lastCrime = user.lastCrime || 0
        const COOLDOWN_CRIME = 60 * 60 * 1000 // 1 hora

        if (now - lastCrime < COOLDOWN_CRIME) {
            const rem = COOLDOWN_CRIME - (now - lastCrime)
            const m = Math.floor(rem / 60000)
            const s = Math.floor((rem % 60000) / 1000)
            return reply("🚨 *A polícia ainda está patrulhando a área!*\n\nAguarde *" + m + "m " + s + "s* para o nível de procurado baixar.")
        }

        user.lastCrime = now
        const success = Math.random() < 0.60 // 60% chance de sucesso

        let doc = "╔══════════════════════════════╗\n"
        doc += "║    🎭 *CRIME & SUBMUNDO* 🎭    ║\n"
        doc += "╚══════════════════════════════╝\n\n"

        if (success) {
            const c = CRIMES_SUCESSO[Math.floor(Math.random() * CRIMES_SUCESSO.length)]
            const coinsEarned = Math.floor(Math.random() * 500) + 400
            const xpEarned = Math.floor(Math.random() * 80) + 60

            user.coins = (user.coins || 0) + coinsEarned
            user.xp = (user.xp || 0) + xpEarned
            user.crimesCometidos = (user.crimesCometidos || 0) + 1

            doc += `🔥 *CRIME BEM-SUCEDIDO!*\n`
            doc += `🏴‍☠️ *Operação:* *${c.crime}*\n`
            doc += `📜 *Detalhes:* _${c.desc}_\n\n`
            doc += `╭━〔 💰 BOTIM OBTIDO 〕━⬣\n`
            doc += `┃ 💵 *Ganhos:* +${coinsEarned.toLocaleString('pt-BR')} Coins\n`
            doc += `┃ ⭐ *XP Ilícito:* +${xpEarned.toLocaleString('pt-BR')} XP\n`
            doc += `┃ 💰 *Novo Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
        } else {
            const f = CRIMES_FALHA[Math.floor(Math.random() * CRIMES_FALHA.length)]
            const fine = Math.min(user.coins || 0, Math.floor(Math.random() * 300) + 250)
            const hpLoss = Math.floor(Math.random() * 20) + 15

            user.coins = Math.max(0, (user.coins || 0) - fine)
            user.hp = Math.max(1, (user.hp || 100) - hpLoss)

            doc += `💀 *A POLÍCIA TE CAPTUROU!*\n`
            doc += `🚨 *Ocorrência:* *${f.crime}*\n`
            doc += `📜 *Detalhes:* _${f.desc}_\n\n`
            doc += `╭━〔 ⚖️ PENALIDADES APLICADAS 〕━⬣\n`
            doc += `┃ 💸 *Multa Paga:* -${fine.toLocaleString('pt-BR')} Coins\n`
            doc += `┃ 💔 *Dano Físico:* -${hpLoss} HP (Seu HP: ${user.hp}/100)\n`
            doc += `┃ 💰 *Saldo Restante:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`
        }

        await dataService.saveXpData(xpData)
        doc += `\n👑 *${botName}*`
        return reply(doc.trim(), [sender])
    }
}
