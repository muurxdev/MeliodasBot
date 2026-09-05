/**
 * Comando .darbeijo — Dá um beijo carinhoso na bochecha de alguém: .darbeijo [nome]
 */
module.exports = {
    name: "darbeijo",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Dá um beijo carinhoso na bochecha de alguém: .darbeijo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu crush";
            return reply(`💋 *BEIJO DE AFETO!*\n\nVocê deu um beijo suave na bochecha de *${alvo}*! O clima ficou todo romântico no ar.`);
        }
};
