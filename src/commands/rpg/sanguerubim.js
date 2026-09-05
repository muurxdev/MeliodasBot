/**
 * Comando .sanguerubim — Examina as propriedades do Sangue de Demônio Vermelho: .sanguerubim
 */
module.exports = {
    name: "sanguerubim",
    aliases: [],
    category: "rpg",
    subcategory: "Mutação",
    description: "Examina as propriedades do Sangue de Demônio Vermelho: .sanguerubim",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🩸 *SANGUE DE DEMÔNIO VERMELHO*\n\n▫️ Fonte primordial de poder demoníaco sintetizada nos laboratórios subterrâneos de Liones.\n▫️ Gera mutações explosivas e eleva o poder mágico para mais de 1.000 pontos.`);
        }
};
