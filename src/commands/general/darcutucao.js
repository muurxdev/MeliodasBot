/**
 * Comando .darcutucao — Dá uma cutucada na costela de alguém: .darcutucao [nome]
 */
module.exports = {
    name: "darcutucao",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Dá uma cutucada na costela de alguém: .darcutucao [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "alguém distraído";
            return reply(`👉 *CUTUCADA!*\n\nVocê cutucou as costelas de *${alvo}* dizendo: "Acorda, guerreiro, hora de lutar!"`);
        }
};
