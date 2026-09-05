/**
 * Comando .aplaudir — Aplaude a jogada ou resposta de alguém: .aplaudir [nome]
 */
module.exports = {
    name: "aplaudir",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Aplaude a jogada ou resposta de alguém: .aplaudir [nome]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "o vencedor";
            return reply(`👏 *APLAUSOS DE PÉ!*\n\nVocê aplaudiu calorosamente o feito incrível de *${alvo}*! Dignos de aplausos reais!`);
        }
};
