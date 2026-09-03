/**
 * Comando .topativos / .maisativos
 * Ranking dos participantes com maior número de mensagens enviadas no grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "topativos",
    aliases: ["maisativos", "rankmensagens", "topchat", "ativos"],
    category: "admin",
    description: "Exibe o ranking dos participantes mais ativos e participativos do grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, from, reply }) => {
        const botName = getBotName();
        const entries = dataService.userRepo.getTopXp(10);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *TOP 10 MAIS ATIVOS* 🏆   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🔥 *Membros com maior engajamento recente:*\n\n`;

        const mentions = [];
        entries.forEach(([jid, user], idx) => {
            const num = jid.split("@")[0].split(":")[0];
            mentions.push(jid);
            const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
            doc += `┃ ${medals[idx]} @${num}\n`;
            doc += `┃    └ ⭐ *Nível:* ${user.level || 1} | 💬 *XP:* ${(user.xp || 0).toLocaleString("pt-BR")}\n`;
        });

        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), mentions);
    }
};

