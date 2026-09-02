const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "resgatarpremio",
    aliases: ["resgatarcupom", "usarcupom", "codigopromo"],
    category: "economy",
    description: "Resgate códigos promocionais de eventos para ganhar moedas",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const codigo = (args[0] || "").toUpperCase().trim();
        if (!codigo) return reply("❌ Informe o código promocional a ser resgatado (ex: `.resgatarpremio MELIODAS2026`).");

        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.coins = (user.coins || 0) + 1500;
        await dataService.saveXpData(xpData);

        return reply("🎉 *CÓDIGO VALIDADO COM SUCESSO!*\n\n🎟️ Código: `" + codigo + "`\n💰 Recompensa: +" + formatCoins(1500) + " creditados!");
    }
};