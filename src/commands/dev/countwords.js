/**
 * Comando .countwords — Conta palavras de um texto: .countwords <texto>
 */
module.exports = {
    name: "countwords",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Conta palavras de um texto: .countwords <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ").trim();
            if (!t) return reply("Uso: `.countwords <texto>`");
            const count = t.split(/\s+/).filter(Boolean).length;
            return reply(`📝 *Contagem:* O texto contém *${count}* palavras.`);
        }
};
