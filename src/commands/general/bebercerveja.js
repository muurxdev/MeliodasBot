/**
 * Comando .bebercerveja — Toma um gole farto da famosa Cerveja de Bernia: .bebercerveja
 */
module.exports = {
    name: "bebercerveja",
    aliases: [],
    category: "general",
    subcategory: "Taverna",
    description: "Toma um gole farto da famosa Cerveja de Bernia: .bebercerveja",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            return reply("🍺 *GLUP, GLUP... AAH!*\n\nCerveja gelada e encorpada de Bernia! O sabor amargo e fresco revigora sua força de vontade!");
        }
};
