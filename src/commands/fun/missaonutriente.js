/**
 * Comando .missaonutriente — Cardápio do dia sugerido pelo Hawk: .missaonutriente
 */
module.exports = {
    name: "missaonutriente",
    aliases: [],
    category: "fun",
    subcategory: "Humor",
    description: "Cardápio do dia sugerido pelo Hawk: .missaonutriente",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🐷🍲 *MENU DO MESTRE HAWK*\n\n\"Oink! O cardápio especial de hoje é:\n▫️ Restos de torta de carne de Danafor\n▫️ Batatas assadas levemente queimadas pelo Meliodas\n▫️ Caneca de suco de maçã da floresta\nComa tudo pra ficar forte como o Capitão das Sobras!\"");
        }
};
