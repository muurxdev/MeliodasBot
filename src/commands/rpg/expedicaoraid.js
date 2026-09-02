const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "expedicaoraid",
    aliases: ["expedicaoauto", "farmrpgauto", "expedicaofora"],
    category: "rpg",
    description: "Inicie ou resgate recompensas de expedições automáticas",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const ganhoXp = 500;
        const ganhoCoins = 1000;

        user.xp = (user.xp || 0) + ganhoXp;
        user.coins = (user.coins || 0) + ganhoCoins;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "EXPEDIÇÃO DE AVENTUREIROS — RETORNO",
            icon: "⛺",
            subtitle: `🗺️ *Líder da Tropa:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "SAQUE DA EXPEDIÇÃO",
                    icon: "🎒",
                    fields: [
                        { label: "Território Explorado", value: "Ruínas do Castelo de Camelot", icon: "🏰" },
                        { label: "Experiência Coletada", value: `+${formatXP(ganhoXp)}`, icon: "⚡" },
                        { label: "Ouro Saqueado", value: `+${formatCoins(ganhoCoins)}`, icon: "💰" }
                    ]
                }
            ],
            tip: "Envie expedições antes de dormir para acordar com baús cheios!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};