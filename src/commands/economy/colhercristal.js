/**
 * Comando .colhercristal — Colhe cristais de mana maduros: .colhercristal
 */
module.exports = {
    name: "colhercristal",
    aliases: [],
    category: "economy",
    subcategory: "Cultivo",
    description: "Colhe cristais de mana maduros: .colhercristal",
    cooldownMs: 3500,
    execute: async ({ reply }) => {
            const colheita = Math.floor(Math.random() * 6) + 2;
            return reply(`💎🌾 *COLHEITA DE CRISTAIS CONCLUÍDA*\n\nOs cristais atingiram o ápice de pureza!\nVocê recolheu *${colheita} Cristais de Mana Azuis* (+💰 ${colheita * 220} moedas)!`);
        }
};
