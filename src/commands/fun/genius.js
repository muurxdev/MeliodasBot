/**
 * MeliodasBot — Comando .genius
 * Memorize e repita a sequência de cores mágicas
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "genius",
    aliases: ["jogogenius", "sequenciacores", "simonsays"],
    category: "fun",
    description: "Memorize e repita a sequência de cores mágicas",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const seq = ["🔴 Vermelho", "🔵 Azul", "🟢 Verde", "🟡 Amarelo"];
    const card = renderCard({
        title: "DESAFIO GENIUS — MEMORIZE!",
        icon: "🧠",
        subtitle: "✨ *Sequência de Cores*",
        sections: [
            {
                title: "PADRÃO A MEMORIZAR",
                icon: "🎨",
                fields: [seq.join(" ➔ ")]
            }
        ],
        tip: "Envie as cores na ordem correta para ganhar bônus de XP!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
