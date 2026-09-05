/**
 * Comando .removeduplicates — Remove palavras duplicadas consecutivas: .removeduplicates <texto>
 */
module.exports = {
    name: "removeduplicates",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Remove palavras duplicadas consecutivas: .removeduplicates <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.removeduplicates <texto>`");
            const words = t.split(/\s+/);
            const clean = words.filter((w, i) => i === 0 || w.toLowerCase() !== words[i - 1].toLowerCase());
            return reply(`🧹 *Sem duplicatas repetidas:*\n${clean.join(" ")}`);
        }
};
