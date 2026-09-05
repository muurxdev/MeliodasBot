/**
 * Comando .assustar — Pula por trás de alguém para dar um susto: .assustar [nome]
 */
module.exports = {
    name: "assustar",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Pula por trás de alguém para dar um susto: .assustar [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "alguém desatento";
            return reply(`👻💥 *BUUUUH!*\n\nVocê pulou por trás de *${alvo}*! A pessoa deu um pulo de 2 metros de altura de susto!`);
        }
};
