const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "recompensaativa",
    aliases: ["bonusatividade", "recompensa-chat", "streakbonus"],
    category: "economy",
    description: "Receba bônus em moedas por participar ativamente do grupo",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const bonus = 350;
        user.coins = (user.coins || 0) + bonus;
        await dataService.saveXpData(xpData);

        return reply(`🔥 *BÔNUS DE ATIVIDADE RESGATADO!*\n\n💬 Por sua constante interação no Reino, você recebeu +${formatCoins(bonus)}!`);
    }
};