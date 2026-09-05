/**
 * Comando .festachapeu — Declara rodada aberta de diversão na taverna: .festachapeu
 */
module.exports = {
    name: "festachapeu",
    aliases: [],
    category: "general",
    subcategory: "Taverna",
    description: "Declara rodada aberta de diversão na taverna: .festachapeu",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply("🎺🎻 *RODADA ABERTA NO BOAR HAT!*\n\nMeliodas abriu um novo barril de cidra e o Hawk começou a dançar sapateado em cima do balcão!");
        }
};
