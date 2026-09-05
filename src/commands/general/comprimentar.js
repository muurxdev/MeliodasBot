/**
 * Comando .comprimentar — Saúda os clientes e amigos da taverna: .comprimentar [nome]
 */
module.exports = {
    name: "comprimentar",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Saúda os clientes e amigos da taverna: .comprimentar [nome]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "pessoal";
            return reply(`👋 *SAUDAÇÃO DO BOAR HAT*\n\n"Olá, *${alvo}*! Puxe um banco, peça uma bebida e seja muito bem-vindo!"`);
        }
};
