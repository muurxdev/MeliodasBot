/**
 * MeliodasBot — Comando .cassino
 * Caça-níqueis animado (Slots 🎰) com multiplicadores de até 10x
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

const SYMBOLS = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣"];

module.exports = {
    name: "cassino",
    aliases: ["slots", "cacaniqueis", "caca-niquel", "jackpot"],
    category: "economy",
    description: "Aposte suas moedas no caça-níqueis e tente acertar o Jackpot!",
    cooldownMs: 5000,
    execute: async ({ sender, args, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const betAmount = parseInt(args && args[0], 10) || 50;

        if (isNaN(betAmount) || betAmount < 10) {
            return reply("🪙 *Valor Inválido:* O valor mínimo de aposta no caça-níqueis é de **10 Coins**.\n👉 Exemplo: `.cassino 100`");
        }

        if ((user.coins || 0) < betAmount) {
            return reply(`🪙 *Saldo Insuficiente:* Você possui apenas **${(user.coins || 0).toLocaleString("pt-BR")} Coins** na carteira.`);
        }

        user.coins -= betAmount;

        const s1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const s2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const s3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

        let multiplier = 0;
        let outcomeMsg = "";

        // 3 iguais
        if (s1 === s2 && s2 === s3) {
            if (s1 === "7️⃣") {
                multiplier = 10;
                outcomeMsg = "🌟🔥 **SUPER JACKPOT TRIPLO 7! (10x)** 🔥🌟";
            } else if (s1 === "💎") {
                multiplier = 8;
                outcomeMsg = "💎 **JACKPOT DE DIAMANTES! (8x)** 💎";
            } else if (s1 === "⭐") {
                multiplier = 6;
                outcomeMsg = "⭐ **ESTRELA DA FORTUNA! (6x)** ⭐";
            } else {
                multiplier = 4;
                outcomeMsg = "🎉 **TRIPLA COMBINAÇÃO! (4x)** 🎉";
            }
        }
        // 2 iguais
        else if (s1 === s2 || s2 === s3 || s1 === s3) {
            multiplier = 2;
            outcomeMsg = "✨ **DUPLA DA SORTE! (2x)** ✨";
        } else {
            outcomeMsg = "💸 **NENHUMA COMBINAÇÃO... VOCÊ PERDEU!**";
        }

        const winAmount = betAmount * multiplier;
        if (winAmount > 0) {
            user.coins += winAmount;
        }

        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║       🎰 *CAÇA-NÍQUEIS* 🎰       ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━━━〔 🎰 SLOTS 〕━━━⬣\n`;
        doc += `┃     [ ${s1} | ${s2} | ${s3} ]\n`;
        doc += `╰━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `${outcomeMsg}\n\n`;
        doc += `💵 *Aposta:* ${betAmount.toLocaleString("pt-BR")} Coins\n`;
        doc += `💰 *Retorno:* ${winAmount > 0 ? ("+" + winAmount.toLocaleString("pt-BR") + " Coins") : ("-" + betAmount.toLocaleString("pt-BR") + " Coins")}\n`;
        doc += `🪙 *Novo Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n`;

        return reply(doc.trim());
    }
};

