/**
 * Comando .blacklistword
 * Cadastra uma palavra ou termo proibido no filtro do grupo
 */

module.exports = {
    name: "blacklistword",
    aliases: ["palavraproibida", "banirpalavra", "bloquearpalavra"],
    category: "admin",
    description: "Cadastra uma palavra ou termo proibido no filtro do grupo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("❌ Funcionalidade em desenvolvimento — filtro de palavras ainda não implementado.");
}
};
