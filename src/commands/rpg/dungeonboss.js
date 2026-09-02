const { renderCard, formatXP, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "dungeonboss",
    aliases: ["chefao", "bossmasmorra", "chefedungeon"],
    category: "rpg",
    description: "Desafie o chefe final guardião da masmorra",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const vitoria = Math.random() > 0.4;
        const xp = vitoria ? 600 : 100;
        const coins = vitoria ? 1200 : 200;

        user.xp = (user.xp || 0) + xp;
        user.coins = (user.coins || 0) + coins;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "CONFRONTO CONTRA O CHEFE DA DUNGEON",
            icon: "👹",
            subtitle: `⚔️ *Desafiante:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "DESFECHO DA BATALHA",
                    icon: "🏆",
                    fields: [
                        { label: "Chefe", value: "Golias Blindado de Baste", icon: "🛡️" },
                        { label: "Resultado", value: vitoria ? "👑 *VITÓRIA ÉPICA! O Chefe caiu!*" : "💀 *DERROTADO PELO CHEFE!*", icon: "⚔️" },
                        { label: "Recompensa", value: `+${formatXP(xp)} | +${formatCoins(coins)}`, icon: "🎁" }
                    ]
                }
            ],
            tip: "Aprimore suas armas no ferreiro para garantir a vitória!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};