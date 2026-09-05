/**
 * Comando .nivelpaz — Mede o nível de serenidade mental do herói: .nivelpaz
 */
module.exports = {
    name: "nivelpaz",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Mede o nível de serenidade mental do herói: .nivelpaz",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const p = Math.floor(Math.random() * 50) + 50;
            return reply(`🕊️ *EQUILÍBRIO INTERIOR*\nSeu nível de paz espiritual: *${p}%*! A mente está calma como a água da nascente druídica.`);
        }
};
