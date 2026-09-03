/**
 * Comando .voteban
 * Inicia uma votação democrática de banimento de participante no grupo
 */

module.exports = {
    name: "voteban",
    aliases: ["votacaoban", "votarban", "pollban"],
    category: "admin",
    description: "Inicia uma votação democrática no grupo para banir um participante",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        return reply("❌ Funcionalidade em desenvolvimento — sistema de votação não implementado.");
    }
};

