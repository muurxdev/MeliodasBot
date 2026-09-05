/**
 * Comando .rot47 — Cifra e decifra texto usando algoritmo ROT47: .rot47 <texto>
 */
module.exports = {
    name: "rot47",
    aliases: [],
    category: "dev",
    subcategory: "Cifra",
    description: "Cifra e decifra texto usando algoritmo ROT47: .rot47 <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.rot47 <texto>`");
            let res = "";
            for (let i = 0; i < t.length; i++) {
                const c = t.charCodeAt(i);
                if (c >= 33 && c <= 126) res += String.fromCharCode(33 + ((c + 14) % 94));
                else res += t[i];
            }
            return reply(`🔒 *ROT47:*\n\`${res}\``);
        }
};
