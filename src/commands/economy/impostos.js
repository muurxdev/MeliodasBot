const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "impostos",
    aliases: ["tributos", "receitafederal", "restituicao"],
    category: "economy",
    description: "Verifique a arrecadação do Reino e solicite restituição",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        const now = Date.now();
        const lastImpostos = user.lastImpostos || 0;
        const COOLDOWN_24H = 24 * 60 * 60 * 1000;
        if (now - lastImpostos < COOLDOWN_24H) {
            const remaining = COOLDOWN_24H - (now - lastImpostos);
            const hours = Math.ceil(remaining / (60 * 60 * 1000));
            return reply(`⏳ Você já solicitou restituição hoje! Volte em *${hours}h*.`);
        }

        const restitui = Math.floor(Math.random() * 300) + 100;
        user.coins = (user.coins || 0) + restitui;
        user.lastImpostos = Date.now();
        await dataService.saveXpData(xpData);

        return reply(`🏛️ *RESTITUIÇÃO DE TRIBUTOS LIBERADA!*\n\n💰 O Tesouro Real de Liones restituiu *${formatCoins(restitui)}* de taxas cobradas!`);
    }
};