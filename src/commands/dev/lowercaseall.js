/**
 * Comando .lowercaseall — Converte todo o texto para minúsculas: .lowercaseall <texto>
 */
module.exports = {
    name: "lowercaseall",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Converte todo o texto para minúsculas: .lowercaseall <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.lowercaseall <texto>`");
            return reply(`🔡 *minúsculas:*\n${t.toLowerCase()}`);
        }
};
