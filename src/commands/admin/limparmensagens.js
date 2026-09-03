/**
 * Comando .limparmensagens
 * Limpa as mensagens de comando recentes do chat
 */

module.exports = {
    name: "limparmensagens",
    aliases: ["limparchat", "purgebot", "apagarultimas"],
    category: "admin",
    description: "Limpa as mensagens de comando recentes do chat",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("❌ Funcionalidade em desenvolvimento — limpeza de mensagens ainda não implementada.");
}
};
