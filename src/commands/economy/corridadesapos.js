const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "corridadesapos",
    aliases: ["sapocorrida", "corridasapo", "apostasapo"],
    category: "economy",
    description: "Aposte em um dos sapos saltadores mágicos de Britânia",
    cooldownMs: 4000,
    execute: async ({ sender, reply, args }) => {
        const aposta = parseInt(args[0], 10) || 300;
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if ((user.coins || 0) < aposta) return reply(`❌ Saldo insuficiente! Precisa de ${formatCoins(aposta)}.`);

        user.coins -= aposta;
        const vitoria = Math.random() > 0.6;
        let premio = 0;
        if (vitoria) {
            premio = aposta * 3;
            user.coins += premio;
        }
        await dataService.saveXpData(xpData);

        return reply(`🐸 *CORRIDA DE SAPOS FINALIZADA!*\n\n🏁 Sapo Saltador Verde 🟢 cruzou a linha!\n${vitoria ? `🎉 *SEU SAPO VENCEU!* +${formatCoins(premio)} (3x)` : "❌ *Seu sapo ficou em 2º lugar!*"}`);
    }
};