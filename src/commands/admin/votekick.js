/**
 * Comando .votekick
 * Inicia uma votação democrática no grupo para expulsar temporariamente um participante
 */

module.exports = {
    name: "votekick",
    aliases: ["votarexpulsao", "kickvote", "votoexpulsar"],
    category: "admin",
    description: "Inicia uma votação de expulsão democrática para um participante",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        return reply("❌ Funcionalidade em desenvolvimento — sistema de votação não implementado.");
    }
};

