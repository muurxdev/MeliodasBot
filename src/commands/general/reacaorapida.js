/**
 * Comando .reacaorapida — Dispara um teste de reação relâmpago no chat: .reacaorapida
 */
module.exports = {
    name: "reacaorapida",
    aliases: [],
    category: "general",
    subcategory: "Jogos",
    description: "Dispara um teste de reação relâmpago no chat: .reacaorapida",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("⚡ *TESTE DE REAÇÃO RELÂMPAGO!*\n\nQuem mandar qualquer emoji primeiro ganha o troféu de guerreiro mais veloz da taverna!");
        }
};
