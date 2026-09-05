/**
 * Comando .amaldicoaramigo — Lança uma maldição cômica em alguém: .amaldicoaramigo [nome]
 */
module.exports = {
    name: "amaldicoaramigo",
    aliases: [],
    category: "general",
    subcategory: "Magia",
    description: "Lança uma maldição cômica em alguém: .amaldicoaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "seu amigo";
            return reply(`😈 *MALDIÇÃO CÔMICA!*\n\nVocê lançou a maldição do soluço eterno em *${alvo}*! Soluços a cada 10 segundos!`);
        }
};
