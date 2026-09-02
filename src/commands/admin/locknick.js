/**
 * MeliodasBot — Comando .locknick / .antifakenick
 * Ativa o monitoramento contra alteração de apelidos ofensivos no grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "locknick",
    aliases: ["antifakenick", "travarapelido", "bloquearnick"],
    category: "admin",
    description: "Ativa ou desativa a proteção contra apelidos falsos e ofensivos",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao"].includes(opt);

        if (!isEnable && !isDisable) {
            const cur = Boolean(configs[from].locknick);
            return reply(`🔒 *PROTEÇÃO DE NICK:* ${cur ? "🟢 ATIVADO" : "🔴 DESATIVADO"}\n\n• \`.locknick on\` — Ativar\n• \`.locknick off\` — Desativar`);
        }

        configs[from].locknick = isEnable;
        await dataService.saveConfigsData(configs);

        return reply(`🛡️ *PROTEÇÃO DE NICK:* ${isEnable ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"} com sucesso!`);
    }
};

