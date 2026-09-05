/**
 * Comando .cofresecreto — Acessa o cofre oculto no porão do Boar Hat: .cofresecreto
 */
module.exports = {
    name: "cofresecreto",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Acessa o cofre oculto no porão do Boar Hat: .cofresecreto",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            return reply(`🗝️ *COFRE OCULTO NO PORÃO*\n\nProtegido por um feitiço de ilusão de Merlin.\nNenhum batedor de carteiras ou demônio consegue enxergar este compartimento!`);
        }
};
