/**
 * Comando .brindebarbeer — Faz um brinde com todos no Boar Hat: .brindebarbeer
 */
module.exports = {
    name: "brindebarbeer",
    aliases: [],
    category: "general",
    subcategory: "Taverna",
    description: "Faz um brinde com todos no Boar Hat: .brindebarbeer",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🍻 *TIM-TIM! UM BRINDE À VIDA!*\n\nCanecas erguidas para cima! \"À amizade, às vitórias e aos Sete Pecados Capitais! Saúde!\"");
        }
};
