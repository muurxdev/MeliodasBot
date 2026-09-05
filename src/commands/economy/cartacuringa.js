/**
 * Comando .cartacuringa — Tenta a sorte na carta surpresa do Coringa: .cartacuringa
 */
module.exports = {
    name: "cartacuringa",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Tenta a sorte na carta surpresa do Coringa: .cartacuringa",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const surpresas = [
                "🃏 O Coringa te entregou uma bolsa de 💰 1.000 moedas!",
                "🃏 O Coringa trocou sua moeda por uma pedra comum...",
                "🃏 O Coringa multiplicou seu ouro do bolso por 1.5x!",
                "🃏 O Coringa sumiu em uma fumaça roxa dando risadas!"
            ];
            return reply(`🎭 *CARTA CORINGA*\n\n${surpresas[Math.floor(Math.random() * surpresas.length)]}`);
        }
};
