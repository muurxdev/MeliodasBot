/**
 * Comando .comemorar — Comemora uma vitória com fogos e festa: .comemorar
 */
module.exports = {
    name: "comemorar",
    aliases: ["comemorar-cmd","cmd-comemorar"],
    category: "general",
    subcategory: "Interação",
    description: "Comemora uma vitória com fogos e festa: .comemorar",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🎉🥳 *FESTA DA VITÓRIA!*\n\nCanecas pro alto, música celta tocando e risadas ecoando pela taverna inteira!");
        }
};
