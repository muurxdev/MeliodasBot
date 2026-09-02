/**
 * MeliodasBot — Comando .curiosidadeanime
 * Fatos e curiosidades de bastidores sobre o mundo dos animes
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "curiosidadeanime",
    aliases: ["fatoanime", "sabianime", "curiosidadesotaku"],
    category: "general",
    description: "Fatos e curiosidades de bastidores sobre o mundo dos animes",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("💡 *VOCÊ SABIA?*\n\nO nome do bar de Meliodas, *Boar Hat*, é uma referência direta ao Porco Verde Hawk que carrega a taverna inteira nas costas!");
}
};
