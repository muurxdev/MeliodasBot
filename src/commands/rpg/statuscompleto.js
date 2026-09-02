const { renderCard, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "statuscompleto",
    aliases: ["atributoscompletos", "minhaficha", "fichadetalhada"],
    category: "rpg",
    description: "Painel analítico completo de atributos de combate e bônus",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};

        const card = renderCard({
            title: "FICHA ANALÍTICA DE COMBATE",
            icon: "📜",
            subtitle: `👤 *Herói:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "ATRIBUTOS PRINCIPAIS",
                    icon: "⚔️",
                    fields: [
                        { label: "Poder de Combate (CP)", value: formatNumber(user.rpg.cp || 1200), icon: "🔥" },
                        { label: "Ataque Total", value: `${user.rpg.atk || 120} (+25 bônus)`, icon: "🗡️" },
                        { label: "Defesa Total", value: `${user.rpg.def || 95} (+20 bônus)`, icon: "🛡️" },
                        { label: "HP Máximo", value: `${user.rpg.hp || 1000} / ${user.rpg.maxHp || 1000}`, icon: "❤️" }
                    ]
                },
                {
                    title: "COEFICIENTES ESPECIAIS",
                    icon: "📊",
                    fields: [
                        { label: "Taxa Crítica", value: "28.5%", icon: "🎯" },
                        { label: "Dano Crítico", value: "215%", icon: "💥" },
                        { label: "Roubo de Vida", value: "12%", icon: "🩸" },
                        { label: "Esquiva", value: "15%", icon: "💨" }
                    ]
                }
            ],
            tip: "Evolua suas armas e equipe runas para aumentar seus coeficientes!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};