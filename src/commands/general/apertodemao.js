/**
 * Comando .apertodemao — Cumprimenta alguém com aperto de mão firme de cavaleiro: .apertodemao [nome]
 */
module.exports = {
    name: "apertodemao",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Cumprimenta alguém com aperto de mão firme de cavaleiro: .apertodemao [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "outro cavaleiro";
            return reply(`🤝 *CUMPRIMENTO DE HONRA*\n\nVocê trocou um aperto de mão firme e respeitoso com *${alvo}*. Aliança confirmada!`);
        }
};
