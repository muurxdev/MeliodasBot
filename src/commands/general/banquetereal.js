/**
 * Comando .banquetereal — Serve o grande banquete do Rei de Liones no chat: .banquetereal
 */
module.exports = {
    name: "banquetereal",
    aliases: [],
    category: "general",
    subcategory: "Taverna",
    description: "Serve o grande banquete do Rei de Liones no chat: .banquetereal",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply("🍗🥧🍷 *GRANDE BANQUETE REAL DE LIONES*\n\nMesas fartas de tortas douradas, carnes nobres assadas, frutas da floresta e jarras de hidromel servidas para todos no grupo!");
        }
};
