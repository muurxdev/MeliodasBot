/**
 * MeliodasBot — Comando .dilema
 * Apresenta um dilema moral intrigante para o grupo debater
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "dilema",
    aliases: ["dilemamoral", "oquefazer", "dilemaetico"],
    category: "fun",
    description: "Apresenta um dilema moral intrigante para o grupo debater",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const dilemas = [
        "Você prefere ter a capacidade de voar ou de ficar invisível?",
        "Você prefere voltar 10 anos no passado com toda sua memória ou ir 20 anos para o futuro com 10 milhões de reais?",
        "Você prefere nunca mais ter que dormir ou nunca mais ter que comer?"
    ];
    const d = dilemas[Math.floor(Math.random() * dilemas.length)];
    const card = renderCard({
        title: "DILEMA DO GRUPO — DEBATE",
        icon: "⚖️",
        subtitle: "🤔 *Qual seria sua escolha?*",
        sections: [
            {
                title: "QUESTÃO EM PAUTA",
                icon: "❓",
                fields: ['📌 "' + d + '"']
            }
        ],
        tip: "Responda no chat e veja a opinião dos outros membros!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
