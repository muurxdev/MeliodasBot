const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "duelobatalha",
    aliases: ["combaterapido", "lutar-ia", "dueloiarpg"],
    category: "rpg",
    description: "Batalha rápida em turnos contra campeões do Reino",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const vitoria = Math.random() > 0.4;
        const xp = vitoria ? 350 : 80;
        const coins = vitoria ? 700 : 150;

        user.xp = (user.xp || 0) + xp;
        user.coins = (user.coins || 0) + coins;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "DUELO DA ARENA REAL",
            icon: "⚔️",
            subtitle: `👤 *Combatente:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DO EMBATE",
                    icon: "🏆",
                    fields: [
                        { label: "Adversário", value: "Cavaleiro Sagrado Gilthunder", icon: "⚡" },
                        { label: "Desfecho", value: vitoria ? "👑 *VITÓRIA POR NOCAUTE!*" : "💥 *DERROTADO NA ARENA!*", icon: "🎖️" },
                        { label: "Ganhos", value: `+${formatXP(xp)} | +${formatCoins(coins)}`, icon: "🎁" }
                    ]
                }
            ],
            tip: "Desafie outros jogadores com .duelo @user!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};