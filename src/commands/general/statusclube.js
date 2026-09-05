/**
 * Comando .statusclube — Exibe o status do clube de fãs dos Sete Pecados: .statusclube
 */
module.exports = {
    name: "statusclube",
    aliases: [],
    category: "general",
    subcategory: "Grupo",
    description: "Exibe o status do clube de fãs dos Sete Pecados: .statusclube",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🛡️🍻 *CLUBE OFICIAL DOS CAVALEIROS DO BOAR HAT*\n\n▫️ Membros Ativos: 7 Pecados + Elizabeth + Hawk\n▫️ Local: Qualquer colina de Britannia onde a taverna parar\n▫️ Status: Em missão de proteção ao reino!");
        }
};
