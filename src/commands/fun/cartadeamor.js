/**
 * MeliodasBot — Comando .cartadeamor
 * Gera uma declaração romântica poética
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "cartadeamor",
    aliases: ["declaracaoamor", "poemalove", "cartaromantica"],
    category: "fun",
    description: "Gera uma declaração romântica poética",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply('💌 *CARTA DE AMOR:*\n\n"Nem mesmo o Full Counter do Meliodas poderia rebater a força do sentimento que tenho por você. Você ilumina meus dias mais que o Sol do Escanor."');
}
};
