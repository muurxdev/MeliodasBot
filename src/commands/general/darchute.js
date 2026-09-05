/**
 * Comando .darchute — Dá um pontapé cômico estilo Meliodas e Hawk: .darchute [nome]
 */
module.exports = {
    name: "darchute",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Dá um pontapé cômico estilo Meliodas e Hawk: .darchute [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "Hawk";
            return reply(`🦵💨 *PONTAPÉ CÔMICO!*\n\nVocê acertou um chute no traseiro de *${alvo}*, fazendo-o voar girando pelo ar!`);
        }
};
