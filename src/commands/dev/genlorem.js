/**
 * Comando .genlorem — Gera parágrafo Lorem Ipsum para testes: .genlorem
 */
module.exports = {
    name: "genlorem",
    aliases: [],
    category: "dev",
    subcategory: "Dev",
    description: "Gera parágrafo Lorem Ipsum para testes: .genlorem",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            return reply("📄 *Lorem Ipsum Dolor:*\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.");
        }
};
