const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "premiodiario",
    aliases: ["roleta-diaria", "girarroleta", "spinwheel"],
    category: "economy",
    description: "Gire a roleta diária de prêmios da sorte",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        const now = Date.now();
        const lastDaily = user.lastDaily || 0;
        const COOLDOWN_24H = 24 * 60 * 60 * 1000;
        if (now - lastDaily < COOLDOWN_24H) {
            const remaining = COOLDOWN_24H - (now - lastDaily);
            const hours = Math.ceil(remaining / (60 * 60 * 1000));
            return reply(`⏳ Você já girou a roleta hoje! Volte em *${hours}h*.`);
        }

        const coins = Math.floor(Math.random() * 800) + 400;
        const xp = Math.floor(Math.random() * 300) + 150;

        user.coins = (user.coins || 0) + coins;
        user.xp = (user.xp || 0) + xp;
        user.lastDaily = Date.now();
        await dataService.saveXpData(xpData);

        return reply(`🎡 *ROLETA DA SORTE GIRADA!*\n\n🎁 *Prêmio Sorteado:* +${formatCoins(coins)} & +${formatXP(xp)}!\n✨ Volte amanhã para um novo giro!`);
    }
};