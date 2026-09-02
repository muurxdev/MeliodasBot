/**
 * MeliodasBot — Comando .farmpv / .xppv
 * Permite que os donos ativem ou desativem o ganho de XP e farm no PV (privado)
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "farmpv",
    aliases: ["xppv", "pvfarm", "farmxp", "pvxp"],
    category: "owner",
    description: "Ativa ou desativa o ganho de XP e farm no privado (PV) do bot",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, args, isOwner, userRole, sender }) => {
        const botName = getBotName();
        const isUserOwner = isOwner || (userRole && userRole.level >= 5);
        if (!isUserOwner) {
            return reply("❌ *Acesso Negado:* Este comando é exclusivo para os Donos do bot.");
        }

        const configs = dataService.getConfigsData();
        if (!configs["global"]) configs["global"] = {};

        const action = (args[0] || "").toLowerCase().trim();
        const current = configs["global"].allowPvXpFarm === true;
        const senderNum = sender ? sender.split("@")[0].split(":")[0] : "Dono";

        if (!action) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║    ⚙️ *FARM DE XP NO PV* ⚙️    ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `╭━〔 ⚙️ CONTROLE GLOBAL DE XP 〕━⬣\n`;
            doc += `┃ 📈 *Recurso:* Farm de XP no Privado (PV)\n`;
            doc += `┃ ${current ? "🟢" : "🔴"} *Estado Atual:* ${current ? "*ATIVADO (Ganho liberado)*" : "*DESATIVADO (Apenas grupos)*"}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += "📌 *Como alterar:*\n";
            doc += "• \`.farmpv on\` — Liberar ganho de XP no PV\n";
            doc += "• \`.farmpv off\` — Bloquear ganho de XP no PV\n\n";
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        if (action === "on" || action === "ativar" || action === "1" || action === "sim") {
            configs["global"].allowPvXpFarm = true;
            await dataService.saveConfigsData(configs);
            logger.info("[FARM PV] Dono ativou ganho de XP no PV.");

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║    ⚙️ *FARM DE XP NO PV* ⚙️    ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE GLOBAL DE XP 〕━⬣\n`;
            doc += `┃ 📈 *Recurso:* Farm de XP no Privado (PV)\n`;
            doc += `┃ 🟢 *Estado:* *ATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para desativar este recurso:_ \`.farmpv off\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        } else if (action === "off" || action === "desativar" || action === "0" || action === "nao") {
            configs["global"].allowPvXpFarm = false;
            await dataService.saveConfigsData(configs);
            logger.info("[FARM PV] Dono desativou ganho de XP no PV.");

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║    ⚙️ *FARM DE XP NO PV* ⚙️    ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ CONTROLE GLOBAL DE XP 〕━⬣\n`;
            doc += `┃ 📈 *Recurso:* Farm de XP no Privado (PV)\n`;
            doc += `┃ 🔴 *Estado:* *DESATIVADO*\n`;
            doc += `┃ 👤 *Executado por:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para reativar este recurso:_ \`.farmpv on\`\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), sender ? [sender] : []);
        } else {
            return reply("❌ Opção inválida. Use \`.farmpv on\` ou \`.farmpv off\`.");
        }
    }
};
