/**
 * MeliodasBot — Comando .loremipsum
 * Gera texto fictício Lorem Ipsum para preenchimento
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "loremipsum",
    aliases: ["gerarlorem", "lorem", "textoficticio"],
    category: "dev",
    description: "Gera texto fictício Lorem Ipsum para preenchimento",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("📄 *LOREM IPSUM (TEXTO DE PREENCHIMENTO):*\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");
}
};
