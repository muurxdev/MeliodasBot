const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "capslock",
    aliases: ["anticaps", "anti-caps", "maiusculas"],
    category: "admin",
    subcategory: "Moderação",
    description: "Ativa ou desativa o filtro de capslock no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        if (opt === "on" || opt === "1" || opt === "ativar" || opt === "sim") {
            configs[from].antiCapslock = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[CAPSLOCK] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔠 *ANTI-CAPSLOCK ATIVADO* 🔠   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔠 *Recurso:* Filtro Anti-Capslock\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 📊 *Regra:* Mensagens com >70% maiúsculas são deletadas\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.capslock off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao") {
            configs[from].antiCapslock = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[CAPSLOCK] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🔠 *ANTI-CAPSLOCK CONFIGURADO* 🔠   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🔠 *Recurso:* Filtro Anti-Capslock\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar:_ \`.capslock on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        const isEnabled = Boolean(configs[from].antiCapslock);
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔠 *ANTI-CAPSLOCK CONFIGURADO* 🔠   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🔠 *Recurso:* Filtro Anti-Capslock\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📊 *Regra:* Mensagens com >70% maiúsculas são deletadas\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.capslock on\` — Ativar filtro\n`;
        doc += `• \`.capslock off\` — Desativar filtro\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
