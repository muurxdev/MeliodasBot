const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "dividendos",
    aliases: ["coletardividendos", "proventos", "rendimentomensal"],
    category: "economy",
    description: "Colete seus dividendos diários de investimentos e ações",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        const now = Date.now();
        const lastDividendos = user.lastDividendos || 0;
        const COOLDOWN_24H = 24 * 60 * 60 * 1000;
        if (now - lastDividendos < COOLDOWN_24H) {
            const remaining = COOLDOWN_24H - (now - lastDividendos);
            const hours = Math.ceil(remaining / (60 * 60 * 1000));
            return reply(`⏳ Você já coletou seus dividendos hoje! Volte em *${hours}h*.`);
        }

        const proventos = Math.floor(Math.random() * 400) + 250;
        user.coins = (user.coins || 0) + proventos;
        user.lastDividendos = Date.now();
        await dataService.saveXpData(xpData);

        return reply(`💵 *DIVIDENDOS CREDITADOS!*\n\n📈 Você recebeu *${formatCoins(proventos)}* referente aos seus investimentos no Reino!`);
    }
};