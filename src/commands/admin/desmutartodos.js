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
    subcategory: "Moderação",
    description: "Destranca o chat permitindo o envio de mensagens por todos os membros",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, client, reply }) => {
        try {
            await client.groupSettingUpdate(from, "not_announcement");
            return reply("🔓 *CHAT ABERTO!* Todos os participantes podem enviar mensagens.");
        } catch (e) {
            const logger = require("../../core/logger");
            logger.warn(`[DESMUTARTODOS] Falha ao abrir grupo ${from}: ${e.message}`);
            return reply("❌ Falha ao destrancar o grupo. Verifique se o bot é administrador.");
        }
    }
};
