/**
 * Comando .pescaouro — Lança a linha de pesca no Rio Sagrado em busca de tesouros: .pescaouro
 */
module.exports = {
    name: "pescaouro",
    aliases: [],
    category: "economy",
    subcategory: "Pesca",
    description: "Lança a linha de pesca no Rio Sagrado em busca de tesouros: .pescaouro",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const achados = [
                "Peixe Carpa Dourada (Vendida por 💰 400 moedas)",
                "Bota velha com 💰 50 moedas presas no solado",
                "Pequeno baú de pirata com 💰 950 moedas",
                "Anel perdido de um cavaleiro (Vale 💰 600 moedas)",
                "Apenas algas mágicas e uma garrafa vazia"
            ];
            const a = achados[Math.floor(Math.random() * achados.length)];
            return reply(`🎣 *PESCARIA NO RIO SAGRADO*\n\nA boia afundou com força...\n✨ *Você puxou:* ${a}!`);
        }
};
