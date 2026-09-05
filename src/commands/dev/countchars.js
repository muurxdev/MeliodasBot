/**
 * Comando .countchars — Conta o número de caracteres com e sem espaços: .countchars <texto>
 */
module.exports = {
    name: "countchars",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Conta o número de caracteres com e sem espaços: .countchars <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.countchars <texto>`");
            const semEspaco = t.replace(/\s/g, "").length;
            return reply(`📊 *Caracteres:*\n▫️ Total: *${t.length}*\n▫️ Sem espaços: *${semEspaco}*`);
        }
};
