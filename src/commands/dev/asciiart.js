/**
 * MeliodasBot — Comando .asciiart
 * Gera títulos e banners em arte ASCII
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "asciiart",
    aliases: ["gerarascii", "arteascii", "bannerascii"],
    category: "dev",
    description: "Gera títulos e banners em arte ASCII",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("🎨 *BANNER EM ASCII ART:*\n\n```\n[ MELIODAS BOT XP v2.0 ]\n```");
}
};
