/**
 * Comando .antispamlink / .blockexternallinks
 * Filtro inteligente para bloquear canais Telegram, links encurtados e grupos de spam
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "antispamlink",
    aliases: ["bloquearlinkexterno", "antitelegram", "blockexternallinks", "antidivulgacao"],
    category: "admin",
    description: "Bloqueia e expulsa automaticamente links de canais Telegram e sites de phishing",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            const cur = Boolean(configs[from].antispamlink);
            return reply(`🛡️ *ANTI-SPAM DE LINKS EXTERNOS:* ${cur ? "🟢 ATIVADO" : "🔴 DESATIVADO"}\n\n• \`.antispamlink on\` — Ativar\n• \`.antispamlink off\` — Desativar`);
        }

        configs[from].antispamlink = isEnable;
        await dataService.saveConfigsData(configs);

        return reply(`🛡️ *ANTI-SPAM DE LINKS:* ${isEnable ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"} com sucesso!`);
    }
};

