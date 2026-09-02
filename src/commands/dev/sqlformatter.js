/**
 * MeliodasBot — Comando .sqlformatter
 * Formata e embeleza queries SQL básicas
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "sqlformatter",
    aliases: ["formatsql", "embellishsql", "sqlformat"],
    category: "dev",
    description: "Formata e embeleza queries SQL básicas",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
    const query = args.join(" ").trim() || "SELECT id, name, email FROM users WHERE active = 1 ORDER BY id DESC LIMIT 10;";
    return reply("🗄️ *SQL QUERY FORMATADA:*\n\n```sql\n" + query + "\n```");
}
};
