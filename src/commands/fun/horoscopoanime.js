/**
 * Comando .horoscopoanime
 * Previsão astrológica com personagens correspondentes de anime
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "horoscopoanime",
    aliases: ["signoanime", "astrologiaanime", "meusignoanime"],
    category: "fun",
    description: "Previsão astrológica com personagens correspondentes de anime",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "HORÓSCOPO DOS SETE PECADOS",
        icon: "🌌",
        subtitle: "✨ *Previsão Diária*",
        sections: [
            {
                title: "ENERGIA DO DIA",
                icon: "⭐",
                fields: [
                    { label: "Signo Guardião", value: "Leão ♌ (Escanor)", icon: "🦁" },
                    { label: "Elemento", value: "Fogo Solar (Onda de Calor)", icon: "🔥" },
                    { label: "Sorte Hoje", value: "98% de Chance de Vitória no RPG", icon: "🍀" }
                ]
            }
        ],
        tip: "Aproveite a alta energia do dia para desafiar chefes!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
