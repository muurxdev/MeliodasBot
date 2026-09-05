/**
 * Comando .trimspaces — Remove espaços excessivos e duplos: .trimspaces <texto>
 */
module.exports = {
    name: "trimspaces",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Remove espaços excessivos e duplos: .trimspaces <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.trimspaces <texto>`");
            return reply(`🧹 *Texto limpo:*\n${t.trim().replace(/\s+/g, " ")}`);
        }
};
