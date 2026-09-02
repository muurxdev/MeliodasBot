const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "labirinto",
    aliases: ["labirintodrole", "drolelabirinto", "desafiolabirinto"],
    category: "rpg",
    description: "Navegue pelo Labirinto de Rochas de Drole em busca da saída",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const achouSaida = Math.random() > 0.4;

        if (achouSaida) {
            const xp = 450;
            const coins = 900;
            user.xp = (user.xp || 0) + xp;
            user.coins = (user.coins || 0) + coins;
            await dataService.saveXpData(xpData);
            return reply(`🏆 *LABIRINTO SUPERADO!*\n\n🧭 Você encontrou o centro do Labirinto de Drole!\n🎁 *Recompensas:* +${formatXP(xp)} & +${formatCoins(coins)}`);
        } else {
            return reply(`🧱 *PRESO NO LABIRINTO!* As paredes de rocha se moveram e fecharam sua passagem. Tente novamente!`);
        }
    }
};