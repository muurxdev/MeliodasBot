/**
 * Comando .escolhasuprema — Decida um dilema difícil de Britannia: .escolhasuprema
 */
module.exports = {
    name: "escolhasuprema",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "Decida um dilema difícil de Britannia: .escolhasuprema",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const dilemas = [
                "Você prefere: Ter o poder absoluto de Escanor só ao meio-dia OU a imortalidade de Ban?",
                "Você prefere: Comer a comida do Meliodas todo dia OU lutar desarmado contra Galand?",
                "Você prefere: Voar com as asas de King OU ler pensamentos como Gowther?"
            ];
            return reply(`⚖️ *DILEMA SUPREMO*\n\n${dilemas[Math.floor(Math.random() * dilemas.length)]}`);
        }
};
