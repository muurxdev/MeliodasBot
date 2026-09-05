/**
 * Comando .dado100 — Rola um dado percentual de 100 faces (D100)
 */
module.exports = {
    name: "dado100",
    aliases: ["d100","rolard100"],
    category: "fun",
    subcategory: "Jogos",
    description: "Rola um dado percentual de 100 faces (D100)",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const roll = Math.floor(Math.random() * 100) + 1;
            return reply(`🎲 *ROLAGEM D100 (Percentual)*\n\n🎯 *Resultado:* [ *${roll}* ] / 100\n💡 *Porcentagem:* ${roll}%`);
        }
};
