/**
 * Comando .antistatus
 * Ativa ou desativa a proteção contra spam de status no grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antistatus",
    aliases: ["bloquearstatus", "proibirstatus", "statusspam"],
    category: "admin",
    description: "Ativa ou desativa o bloqueio de postagens automáticas e status no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim") {
            configs[from].antistatus = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTISTATUS] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Bloqueio de Spam de Status\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este recurso:_ \`.antistatus off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao") {
            configs[from].antistatus = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTISTATUS] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🛡️ *Recurso:* Bloqueio de Spam de Status\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar este recurso:_ \`.antistatus on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        const isEnabled = Boolean(configs[from].antistatus);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *MODERAÇÃO & SEGURANÇA* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🛡️ *Recurso:* Bloqueio de Spam de Status\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Como alterar:*\n`;
        doc += `• \`.antistatus on\` — Ativar bloqueio\n`;
        doc += `• \`.antistatus off\` — Desativar bloqueio\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
