const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "doacaogrupo",
    aliases: ["chuvademoedas", "droparmoedas", "doartodos"],
    category: "economy",
    description: "Espalhe uma chuva de moedas para os membros do grupo",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ sender, reply, args }) => {
        const valor = parseInt(args[0], 10) || 1000;
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if ((user.coins || 0) < valor) return reply(`❌ Saldo insuficiente! Você possui ${formatCoins(user.coins || 0)}.`);

        user.coins -= valor;
        await dataService.saveXpData(xpData);

        return reply(`🌧️ *CHUVA DE MOEDAS NO GRUPO!*\n\n👑 @${sender.split("@")[0]} lançou uma chuva de *${formatCoins(valor)}* para o grupo!\n✨ O primeiro a mandar mensagem leva o drop!`, [sender]);
    }
};