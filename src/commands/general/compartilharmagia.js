/**
 * Comando .compartilharmagia — Transfere parte do seu mana para um aliado: .compartilharmagia [nome]
 */
module.exports = {
    name: "compartilharmagia",
    aliases: [],
    category: "general",
    subcategory: "Magia",
    description: "Transfere parte do seu mana para um aliado: .compartilharmagia [nome]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu colega";
            return reply(`🔮⚡ *FLUXO DE MANA COMPARTILHADO*\n\nVocê canalizou um feixe místico que recarregou as reservas mágicas de *${alvo}*!`);
        }
};
