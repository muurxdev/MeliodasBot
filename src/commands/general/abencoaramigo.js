/**
 * Comando .abencoaramigo — Lança uma bênção protetora sobre um amigo: .abencoaramigo [nome]
 */
module.exports = {
    name: "abencoaramigo",
    aliases: [],
    category: "general",
    subcategory: "Magia",
    description: "Lança uma bênção protetora sobre um amigo: .abencoaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu aliado";
            return reply(`✨🛡️ *BÊNÇÃO DE PROTEÇÃO*\n\nUma aura dourada cobriu o corpo de *${alvo}*, garantindo resistência mágica reforçada!`);
        }
};
