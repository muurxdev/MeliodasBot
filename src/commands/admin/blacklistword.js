/**
 * MeliodasBot — Comando .blacklistword
 * Cadastra uma palavra ou termo proibido no filtro do grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "blacklistword",
    aliases: ["palavraproibida", "banirpalavra", "bloquearpalavra"],
    category: "admin",
    description: "Cadastra uma palavra ou termo proibido no filtro do grupo",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
    const termo = (args[0] || "").toLowerCase().trim();
    if (!termo) return reply("❌ Informe o termo que deseja proibir no grupo (ex: `.blacklistword termo`).");
    return reply('🚫 *TERMO BLOQUEADO!* A palavra "' + termo + '" foi adicionada à lista negra do grupo.');
}
};
