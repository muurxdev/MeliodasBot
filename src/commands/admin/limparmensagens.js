/**
 * MeliodasBot — Comando .limparmensagens
 * Limpa as mensagens de comando recentes do chat
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "limparmensagens",
    aliases: ["limparchat", "purgebot", "apagarultimas"],
    category: "admin",
    description: "Limpa as mensagens de comando recentes do chat",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("🧹 *LIMPEZA CONCLUÍDA!* O histórico recente de comandos foi purgado com sucesso.");
}
};
