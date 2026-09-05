/**
 * Comando .sonhar — Compartilha um sonho misterioso com os deuses: .sonhar
 */
module.exports = {
    name: "sonhar",
    aliases: [],
    category: "general",
    subcategory: "Descanso",
    description: "Compartilha um sonho misterioso com os deuses: .sonhar",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌙✨ *VISÃO ONÍRICA*\n\nVocê sonhou com os campos floridos de Britannia e os tempos de paz antes da grande guerra...");
        }
};
