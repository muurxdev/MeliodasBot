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

        const now = Date.now();
        const lastAtividade = user.lastAtividade || 0;
        const COOLDOWN_24H = 24 * 60 * 60 * 1000;
        if (now - lastAtividade < COOLDOWN_24H) {
            const remaining = COOLDOWN_24H - (now - lastAtividade);
            const hours = Math.ceil(remaining / (60 * 60 * 1000));
            return reply(`⏳ Você já resgatou a recompensa hoje! Volte em *${hours}h*.`);
        }

        const bonus = 350;
        user.coins = (user.coins || 0) + bonus;
        user.lastAtividade = Date.now();
        await dataService.saveXpData(xpData);

        return reply(`🔥 *BÔNUS DE ATIVIDADE RESGATADO!*\n\n💬 Por sua constante interação no Reino, você recebeu +${formatCoins(bonus)}!`);
    }
};