/**
 * Comando .wordfrequency — Analisa a frequência de repetição de palavras: .wordfrequency <texto>
 */
module.exports = {
    name: "wordfrequency",
    aliases: [],
    category: "dev",
    subcategory: "String",
    description: "Analisa a frequência de repetição de palavras: .wordfrequency <texto>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const t = args.join(" ");
            if (!t) return reply("Uso: `.wordfrequency <texto>`");
            const words = t.toLowerCase().match(/\b\w+\b/g) || [];
            const freq = {};
            for (const w of words) freq[w] = (freq[w] || 0) + 1;
            const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
            return reply(`📊 *Top Palavras Mais Frequentes:*\n${sorted.map(([w, c]) => `▫️ "${w}": ${c}x`).join("\n")}`);
        }
};
