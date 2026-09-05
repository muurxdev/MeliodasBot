/**
 * Comando .conselhomerlin — Conselho enigmático da Maga de Belialuin: .conselhomerlin
 */
module.exports = {
    name: "conselhomerlin",
    aliases: [],
    category: "fun",
    subcategory: "Lore SDS",
    description: "Conselho enigmático da Maga de Belialuin: .conselhomerlin",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🔮 *ENIGMA DE MERLIN*\n\n\"O conhecimento sem curiosidade é estéril; a curiosidade sem cautela é mortal. Aprenda a dosar ambos no cadinho da sua mente.\"");
        }
};
