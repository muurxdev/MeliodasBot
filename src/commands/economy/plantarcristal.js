/**
 * Comando .plantarcristal — Planta uma muda de cristal de mana no jardim do Boar Hat: .plantarcristal
 */
module.exports = {
    name: "plantarcristal",
    aliases: [],
    category: "economy",
    subcategory: "Cultivo",
    description: "Planta uma muda de cristal de mana no jardim do Boar Hat: .plantarcristal",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            return reply(`🌱💎 *CULTIVO DE CRISTAIS*\n\nVocê plantou a semente de cristal no solo abençoado!\nEla absorverá a luz lunar para germinar. Use \`.colhercristal\` mais tarde!`);
        }
};
