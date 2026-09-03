/**
 * Comando .masmorrainfinita / .torreinfinita / .torre
 * Desafio de escalada na Torre Infinita de Britânia (Andares 1 ao 100)
 */

const { renderCard, formatCoins, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "masmorrainfinita",
    aliases: ["torreinfinita", "andartorre", "escalartorre"],
    category: "rpg",
    description: "Escale a Torre Infinita de Britânia enfrentando guardiões a cada andar",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};
        user.rpg.andarTorre = user.rpg.andarTorre || 1;

        const andar = user.rpg.andarTorre;
        const vitoria = Math.random() > 0.35;

        if (vitoria) {
            const xpGanho = andar * 120 + 200;
            const coinsGanho = andar * 250 + 400;

            user.xp = (user.xp || 0) + xpGanho;
            user.coins = (user.coins || 0) + coinsGanho;
            user.rpg.andarTorre += 1;
            await dataService.saveXpData(xpData);

            const card = renderCard({
                title: `TORRE INFINITA — ANDAR ${andar} CONQUISTADO!`,
                icon: "🗼",
                subtitle: `⚔️ *Conquistador:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "RESULTADO DA ESCALADA",
                        icon: "🏆",
                        fields: [
                            { label: "Andar Conquistado", value: `Andar ${andar} (Guardião Derrotado)`, icon: "🗡️" },
                            { label: "Próximo Desafio", value: `Andar ${andar + 1}`, icon: "🚪" },
                            { label: "Recompensas", value: `+${formatXP(xpGanho)} | +${formatCoins(coinsGanho)}`, icon: "🎁" }
                        ]
                    }
                ],
                tip: "Continue escalando para desbloquear títulos de honra exclusivos!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        } else {
            return reply(`💀 *DERROTA NO ANDAR ${andar}!* O guardião da torre repeliu seu ataque. Fortaleça suas armas em \`.forjar\` e tente novamente!`);
        }
    }
};

