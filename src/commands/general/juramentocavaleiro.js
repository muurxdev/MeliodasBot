/**
 * Comando .juramentocavaleiro — Presta o juramento sagrado dos protetores de Britannia: .juramentocavaleiro
 */
module.exports = {
    name: "juramentocavaleiro",
    aliases: [],
    category: "general",
    subcategory: "Roleplay",
    description: "Presta o juramento sagrado dos protetores de Britannia: .juramentocavaleiro",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("🗡️📜 *JURAMENTO SAGRADO DOS CAVALEIROS*\n\n\"Juro pela minha espada e pelo sangue que corre em minhas veias, proteger os inocentes e erguer meu escudo diante do perigo!\"");
        }
};
