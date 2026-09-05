/**
 * Comando .striphtml — Remove tags HTML de um texto: .striphtml <tags>
 */
module.exports = {
    name: "striphtml",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Remove tags HTML de um texto: .striphtml <tags>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.striphtml <codigo_html>`");
            const clean = t.replace(/<[^>]*>?/gm, "");
            return reply(`🧹 *Texto sem HTML:*\n${clean}`);
        }
};
