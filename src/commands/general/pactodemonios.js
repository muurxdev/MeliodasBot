/**
 * Comando .pactodemonios — Sussurra palavras antigas do reino sombrio: .pactodemonios
 */
module.exports = {
    name: "pactodemonios",
    aliases: [],
    category: "general",
    subcategory: "Roleplay",
    description: "Sussurra palavras antigas do reino sombrio: .pactodemonios",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🌑🔮 *MURMÚRIO DO SUBMUNDO*\n\nAs chamas roxas tremeluzem na penumbra...\n\"O poder da escuridão não julga, apenas devora.\"");
        }
};
