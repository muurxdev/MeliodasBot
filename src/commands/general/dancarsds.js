/**
 * Comando .dancarsds — Inicia a clássica Dança de Drole ou Dança das Fadas: .dancarsds
 */
module.exports = {
    name: "dancarsds",
    aliases: [],
    category: "general",
    subcategory: "Interação",
    description: "Inicia a clássica Dança de Drole ou Dança das Fadas: .dancarsds",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("💃🕺 *DANÇA MÍSTICA DA TERRA*\n\nVocê executa passos sincronizados com a terra! O chão vibra e todos ao redor entram no ritmo!");
        }
};
