const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "flood",
    aliases: ["anti-flood", "bloquearflood"],
    category: "admin",
    subcategory: "Moderação",
    description: "Ativa ou desativa a proteção anti-flood no grupo",
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
            configs[from].antiFlood = true;
            configs[from].floodLimit = configs[from].floodLimit || 5;
            await dataService.saveConfigsData(configs);
            logger.info(`[FLOOD] Ativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌊 *ANTI-FLOOD CONFIGURADO* 🌊   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🌊 *Recurso:* Anti-Flood\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 📊 *Limite:* ${configs[from].floodLimit} msgs/minuto\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar:_ \`.flood off\`\n`;
            doc += `💡 _Para ajustar o limite:_ \`.flood limit <n>\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "off" || opt === "0" || opt === "desativar" || opt === "nao") {
            configs[from].antiFlood = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[FLOOD] Desativado em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌊 *ANTI-FLOOD CONFIGURADO* 🌊   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
            doc += `┃ 🌊 *Recurso:* Anti-Flood\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar:_ \`.flood on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        if (opt === "limit" || opt === "limite" || opt === "max") {
            const newLimit = parseInt(args[1], 10);
            if (!newLimit || newLimit < 1 || newLimit > 50) {
                return reply("❌ Informe um número entre 1 e 50.\n\n📌 *Exemplo:* `.flood limit 8`");
            }
            configs[from].floodLimit = newLimit;
            configs[from].antiFlood = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[FLOOD] Limite alterado para ${newLimit} em ${from} por ${sender}`);

            return reply(`✅ *Limite de flood ajustado para ${newLimit} mensagens por minuto!*`);
        }

        const isEnabled = Boolean(configs[from].antiFlood);
        const limit = configs[from].floodLimit || 5;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌊 *ANTI-FLOOD CONFIGURADO* 🌊   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ CONFIGURAÇÃO DE GRUPO 〕━⬣\n`;
        doc += `┃ 🌊 *Recurso:* Anti-Flood\n`;
        doc += `┃ ${isEnabled ? "🟢" : "🔴"} *Estado Atual:* ${isEnabled ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 📊 *Limite:* ${limit} msgs/minuto\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `📌 *Comandos Disponíveis:*\n`;
        doc += `• \`.flood on\` — Ativar anti-flood\n`;
        doc += `• \`.flood off\` — Desativar anti-flood\n`;
        doc += `• \`.flood limit <n>\` — Ajustar limite (1-50)\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
