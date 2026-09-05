/**
 * Comando .nivelamizade — Consulta o nível de amizade com a tripulação do Boar Hat: .nivelamizade
 */
module.exports = {
    name: "nivelamizade",
    aliases: [],
    category: "profile",
    subcategory: "Social",
    description: "Consulta o nível de amizade com a tripulação do Boar Hat: .nivelamizade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🍺 *VÍNCULOS NA TAVERNA*\n\n▫️ Meliodas: Nível 8 (Parceiro de caneca)\n▫️ Elizabeth: Nível 9 (Confiança mútua)\n▫️ Hawk: Nível 10 (Melhor alimentador de sobras)\n▫️ Ban: Nível 7 (Rival de braço de ferro)\n▫️ King: Nível 6 (Cuidado com o travesseiro)");
        }
};
