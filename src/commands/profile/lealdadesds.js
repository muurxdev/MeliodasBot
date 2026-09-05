/**
 * Comando .lealdadesds — Verifica seu voto de lealdade ao capitão Meliodas: .lealdadesds
 */
module.exports = {
    name: "lealdadesds",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Verifica seu voto de lealdade ao capitão Meliodas: .lealdadesds",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🐉 *LEALDADE AO PECADO DA IRA*\n\n▫️ Voto selado com sangue de dragão.\n▫️ Enquanto a chama de Britannia arder, sua espada defenderá o capitão!");
        }
};
