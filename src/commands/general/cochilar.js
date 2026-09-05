/**
 * Comando .cochilar — Tira um cochilo no travesseiro de King (Chastiefol): .cochilar
 */
module.exports = {
    name: "cochilar",
    aliases: [],
    category: "general",
    subcategory: "Descanso",
    description: "Tira um cochilo no travesseiro de King (Chastiefol): .cochilar",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("😴💤 *SONECA RESTAURADORA*\n\nVocê se jogou no travesseiro fofinho de Chastiefol e dormiu feito um anjo por 20 minutos.");
        }
};
