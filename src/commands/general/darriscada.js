/**
 * Comando .darriscada — Dá gargalhadas com a conversa do grupo: .darriscada
 */
module.exports = {
    name: "darriscada",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Dá gargalhadas com a conversa do grupo: .darriscada",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            return reply("🤣 *GARGALHADA COLETIVA!*\n\n\"Kkkkkkkkkk!\", você quase engasgou com a cerveja de tanto rir!");
        }
};
