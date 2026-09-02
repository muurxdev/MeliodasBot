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
        const proventos = Math.floor(Math.random() * 400) + 250;
        user.coins = (user.coins || 0) + proventos;
        await dataService.saveXpData(xpData);

        return reply(`💵 *DIVIDENDOS CREDITADOS!*\n\n📈 Você recebeu *${formatCoins(proventos)}* referente aos seus investimentos no Reino!`);
    }
};