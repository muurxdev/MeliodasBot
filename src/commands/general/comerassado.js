/**
 * Comando .comerassado — Experimenta o assado do dia: .comerassado
 */
module.exports = {
    name: "comerassado",
    aliases: [],
    category: "general",
    subcategory: "Taverna",
    description: "Experimenta o assado do dia: .comerassado",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            return reply("🍖 *NHAC! CARNE ASSADA!*\n\nUma costeleta assada suculenta servida no espeto de carvalho! Energia 100% recarregada.");
        }
};
