const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

function parseDuration(str) {
    const match = str.match(/^(\d+)\s*(m|h|d|min|hour|day|minuto|hora|dia)s?$/i);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === "m" || unit === "min" || unit === "minuto") return value * 60 * 1000;
    if (unit === "h" || unit === "hour" || unit === "hora") return value * 60 * 60 * 1000;
    if (unit === "d" || unit === "day" || unit === "dia") return value * 24 * 60 * 60 * 1000;
    return null;
}

function formatDuration(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(" ") || "0m";
}

module.exports = {
    name: "timeban",
    aliases: ["bantemp", "bantemporario", "tempban"],
    category: "admin",
    subcategory: "Moderação",
    description: "Remove um participante do grupo temporariamente",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, args, reply, sender, client, info }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const target = mentioned
            || (args[0] ? args[0].replace(/[@+\s-]/g, "") + "@s.whatsapp.net" : null);

        if (!target) {
            return reply("❌ *Uso incorreto:* `.timeban @user <tempo>`\n\n📌 *Exemplos:*\n• `.timeban @user 30m`\n• `.timeban @user 2h`\n• `.timeban @user 1d`");
        }

        const durationStr = args[1] || "";
        const durationMs = parseDuration(durationStr);

        if (!durationMs || durationMs <= 0) {
            return reply("❌ *Duração inválida.* Use o formato: `30m`, `2h` ou `1d`");
        }

        const senderNum = sender.split("@")[0].split(":")[0];
        const targetNum = target.split("@")[0].split(":")[0];

        try {
            const groupAuthService = require("../../services/groupAuthService");
            const groupData = await groupAuthService.getGroupData(from, { refresh: true });
            const targetIsAdmin = Array.from(groupData.admins).some(a => groupAuthService.sameUser(a, target));

            if (targetIsAdmin) {
                return reply("❌ Você não pode banir outro administrador do grupo.");
            }

            const apiJid = await groupAuthService.resolveMemberJid(client, target, groupData) || target;
            await client.groupParticipantsUpdate(from, [apiJid], "remove");
            groupAuthService.invalidate(from);

            if (!configs[from].tempBans) configs[from].tempBans = [];
            configs[from].tempBans.push({
                jid: target,
                expiresAt: Date.now() + durationMs,
                bannedBy: sender,
                bannedAt: Date.now()
            });
            await dataService.saveConfigsData(configs);

            logger.info(`[TIMEBAN] ${target} banido por ${formatDuration(durationMs)} em ${from} por ${sender}`);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ⏳ *BANIMENTO TEMPORÁRIO* ⏳   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 ⚙️ DETALHES DO BAN 〕━⬣\n`;
            doc += `┃ 👤 *Usuário:* @${targetNum}\n`;
            doc += `┃ ⏱️ *Duração:* ${formatDuration(durationMs)}\n`;
            doc += `┃ 🛡️ *Administrador:* @${senderNum}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _O membro será automaticamente desbanido após o período._\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [target, sender]);
        } catch (err) {
            logger.error("[TIMEBAN ERROR]", err);
            return reply(`❌ *Falha ao banir membro:* ${err.message}`);
        }
    }
};
