/**
 * Comando .textrot13 — Aplica cifra ROT13 em um texto: .textrot13 <texto>
 */
module.exports = {
    name: "textrot13",
    aliases: [],
    category: "dev",
    subcategory: "Cifra",
    description: "Aplica cifra ROT13 em um texto: .textrot13 <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.textrot13 <texto>`");
            const rot = t.replace(/[a-zA-Z]/g, c => {
                const base = c <= "Z" ? 65 : 97;
                return String.fromCharCode(base + (c.charCodeAt(0) - base + 13) % 26);
            });
            return reply(`🔄 *ROT13:*\n${rot}`);
        }
};
