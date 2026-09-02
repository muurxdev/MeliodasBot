/**
 * MeliodasBot — Comando .piadaaleatoria
 * Conta uma piada ou trocadilho divertido no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "piadaaleatoria",
    aliases: ["contarpiada", "piadinha", "trocadilho"],
    category: "fun",
    description: "Conta uma piada ou trocadilho divertido no grupo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    const piadas = [
        "Por que o desenvolvedor usa óculos escuros? Porque ele programa em C#!",
        "O que o zero disse para o oito? Belo cinto!",
        "Como o Batman faz para que os outros entrem no carro dele? — Bat-bate a porta!"
    ];
    const p = piadas[Math.floor(Math.random() * piadas.length)];
    return reply("😂 *PIADA DO DIA:*\n\n" + p);
}
};
