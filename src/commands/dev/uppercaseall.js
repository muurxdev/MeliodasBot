/**
 * Comando .uppercaseall — Converte todo o texto para MAIÚSCULAS: .uppercaseall <texto>
 */
module.exports = {
    name: "uppercaseall",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Converte todo o texto para MAIÚSCULAS: .uppercaseall <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.uppercaseall <texto>`");
            return reply(`🔠 *MAIÚSCULAS:*\n${t.toUpperCase()}`);
        }
};
