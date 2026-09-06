/**
 * Comando .mutartodos
 * Tranca o grupo imediatamente permitindo apenas mensagens de administradores
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "mutartodos",
    aliases: ["trancarchat", "fechartodos", "silenciargrupo"],
    category: "admin",
    subcategory: "Moderação",
    description: "Tranca o grupo imediatamente permitindo apenas mensagens de administradores",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, client, reply }) => {
        try {
            await client.groupSettingUpdate(from, "announcement");
            return reply("🔒 *CHAT FECHADO COM SUCESSO!* Apenas administradores podem enviar mensagens agora.");
        } catch (e) {
            const logger = require("../../core/logger");
            logger.warn(`[MUTARTODOS] Falha ao fechar grupo ${from}: ${e.message}`);
            return reply("❌ Falha ao trancar o grupo. Verifique se o bot é administrador.");
        }
    }
};
