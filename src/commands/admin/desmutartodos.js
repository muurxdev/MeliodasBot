/**
 * Comando .desmutartodos
 * Destranca o chat permitindo o envio de mensagens por todos os membros
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "desmutartodos",
    aliases: ["destrancarchat", "abrirtodos", "liberargrupo"],
    category: "admin",
    description: "Destranca o chat permitindo o envio de mensagens por todos os membros",
    cooldownMs: 2000,
    execute: async ({ from, client, reply }) => {
    await client.groupSettingUpdate(from, "not_announcement").catch(() => {});
    return reply("🔓 *CHAT ABERTO!* Todos os participantes podem enviar mensagens.");
}
};
