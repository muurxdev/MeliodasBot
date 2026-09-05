/**
 * Comando .testememoria — Sequência de 5 símbolos para teste de memorização rápida: .testememoria
 */
module.exports = {
    name: "testememoria",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "Sequência de 5 símbolos para teste de memorização rápida: .testememoria",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const emojis = ["🐉", "🦁", "🦊", "🐻", "🐗", "🐐", "🐍"];
            const seq = [];
            for (let i = 0; i < 5; i++) seq.push(emojis[Math.floor(Math.random() * emojis.length)]);
            return reply(`🧠 *TESTE DE MEMÓRIA DOS PECADOS*\n\nMemorize esta sequência exata em 5 segundos:\n👉 ${seq.join(" ")}\n\nDepois reproduza no chat sem colar!`);
        }
};
