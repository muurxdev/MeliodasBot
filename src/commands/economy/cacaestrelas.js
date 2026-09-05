/**
 * Comando .cacaestrelas — Coleta fragmentos de estrelas cadentes nas colinas: .cacaestrelas
 */
module.exports = {
    name: "cacaestrelas",
    aliases: [],
    category: "economy",
    subcategory: "Mineração",
    description: "Coleta fragmentos de estrelas cadentes nas colinas: .cacaestrelas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const fragmentos = Math.floor(Math.random() * 4) + 1;
            const valor = fragmentos * 350;
            return reply(`⭐🌠 *FRAGMENTOS ESTELARES*\n\nVocê encontrou *${fragmentos} Poeira(s) Estelar(es)* brilhando na grama úmida!\nVendidas para a guilda por 💰 *${valor} moedas*!`);
        }
};
