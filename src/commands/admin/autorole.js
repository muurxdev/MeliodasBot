/**
 * MeliodasBot — Comando .autorole
 * Configura a atribuição automática de cargos e saudações aos novatos
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "autorole",
    aliases: ["cargoautomatico", "autocargo", "setautorole"],
    category: "admin",
    description: "Configura a atribuição automática de cargos e saudações aos novatos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("👑 *AUTO-ROLE ATIVADO!* Novos membros receberão o título de *Aventureiro Iniciante* ao entrar no grupo.");
}
};
