/**
 * Comando .invertcase — Inverte as maiúsculas e minúsculas: .invertcase <texto>
 */
module.exports = {
    name: "invertcase",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Inverte as maiúsculas e minúsculas: .invertcase <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.invertcase <texto>`");
            const res = t.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("");
            return reply(`🔀 *Invert Case:*\n${res}`);
        }
};
