/**
 * Comando .textb64url — Codifica texto para Base64 URL Safe: .textb64url <texto>
 */
module.exports = {
    name: "textb64url",
    aliases: [],
    category: "dev",
    subcategory: "Cifra",
    description: "Codifica texto para Base64 URL Safe: .textb64url <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.textb64url <texto>`");
            const b64 = Buffer.from(t).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            return reply(`🔒 *Base64URL:*\n\`${b64}\``);
        }
};
