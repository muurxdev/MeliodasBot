/**
 * MeliodasBot — Comando .mutartodos
 * Tranca o grupo imediatamente permitindo apenas mensagens de administradores
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "mutartodos",
    aliases: ["trancarchat", "fechartodos", "silenciargrupo"],
    category: "admin",
    description: "Tranca o grupo imediatamente permitindo apenas mensagens de administradores",
    cooldownMs: 2000,
    execute: async ({ from, client, reply }) => {
    await client.groupSettingUpdate(from, "announcement").catch(() => {});
    return reply("🔒 *CHAT FECHADO COM SUCESSO!* Apenas administradores podem enviar mensagens agora.");
}
};
