/**
 * Comando .fofoca
 * Gera uma fofoca cômica e fictícia sobre o grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "fofoca",
    aliases: ["fofocadogrupo", "noticiafalsa", "babado"],
    category: "fun",
    description: "Gera uma fofoca cômica e fictícia sobre o grupo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    const fofocas = [
        "Flagraram o Meliodas comendo as sobras do Hawk de madrugada!",
        "Dizem que o Ban perdeu todo o dinheiro dele no bingo de Vaizel!",
        "Fontes anônimas afirmam que os admins vão sortear um pastel de vento no fim de semana."
    ];
    const f = fofocas[Math.floor(Math.random() * fofocas.length)];
    return reply("📰 *EXTRA! EXTRA! FOFOCA DO DIA:*\n\n👀 " + f);
}
};
