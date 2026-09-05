/**
 * Comando .orbecristal — Examina o Olho da Paz de Merlin: .orbecristal
 */
module.exports = {
    name: "orbecristal",
    aliases: [],
    category: "rpg",
    subcategory: "Item",
    description: "Examina o Olho da Paz de Merlin: .orbecristal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🔮 *ORBE DA MANIFESTAÇÃO (Aldan)*\n\n▫️ O orbe infinito que paira sobre a mão de Merlin.\n▫️ Permite visão clarividente através de qualquer barreira e serve como receptáculo da alma.`);
        }
};
