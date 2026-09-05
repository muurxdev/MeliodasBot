/**
 * Comando .stopletra — Sorteia uma letra aleatória para brincar de Stop/Adedonha: .stopletra
 */
module.exports = {
    name: "stopletra",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "Sorteia uma letra aleatória para brincar de Stop/Adedonha: .stopletra",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const letras = "ABCDEFGHIJKLMNOPQRSTUVZ";
            const sorteada = letras[Math.floor(Math.random() * letras.length)];
            return reply(`🛑 *STOP / ADEDONHA!*\n\nA letra sorteada é: 🔥 *LETRA [ ${sorteada} ]* 🔥\n\nCategorias: Nome, Animal, Cidade, Cor, Objeto!`);
        }
};
