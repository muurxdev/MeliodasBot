/**
 * Comando .duelopalavras — Duelo de rimas e palavras rápidas: .duelopalavras
 */
module.exports = {
    name: "duelopalavras",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "Duelo de rimas e palavras rápidas: .duelopalavras",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const temas = ["Dragão", "Castelo", "Guerreiro", "Tempestade", "Purgatório"];
            const t = temas[Math.floor(Math.random() * temas.length)];
            return reply(`🎤 *DUELO DE PALAVRAS*\nTema sorteado: *${t}*\nQuem mandar 3 palavras que rimem com esse tema primeiro vence!`);
        }
};
