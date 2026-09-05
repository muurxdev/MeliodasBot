/**
 * Comando .boasvindascustom — Modelo de boas-vindas solenes para novos recrutas: .boasvindascustom
 */
module.exports = {
    name: "boasvindascustom",
    aliases: [],
    category: "admin",
    subcategory: "Boas-vindas",
    description: "Modelo de boas-vindas solenes para novos recrutas: .boasvindascustom",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("👋🛡️ *SAUDAÇÕES AO NOVO RECRUTA!*\n\nSeja muito bem-vindo à nossa guilda!\nPuxe um banco na taverna, leia as regras em `.regrasgrupo` e digite `.menu` para ver todas as funcionalidades de Meliodas Bot!");
        }
};
