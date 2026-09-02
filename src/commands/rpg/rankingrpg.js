/**
 * MeliodasBot — Comando .rankingrpg / .toprpg
 * Mural supremo dos maiores guerreiros de Britânia por poder e nível
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "rankingrpg",
    aliases: ["toprpg", "melhoresguerreiros", "hallfamarpg"],
    category: "rpg",
    description: "Exibe o Hall da Fama dos guerreiros mais poderosos do RPG",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        const sorted = dataService.userRepo.getTopRank(10);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *HALL DA FAMA DO RPG* 🏆   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚔️ TOP 10 MAIORES LENDAS 〕━⬣\n`;

        sorted.forEach(([jid, user], idx) => {
            const num = jid.split("@")[0].split(":")[0];
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🎖️";
            doc += `┃ ${medal} ${idx + 1}º: @${num} ➔ Nível ${user.level || 1} (${(user.xp || 0).toLocaleString("pt-BR")} XP)\n`;
        });

        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), sorted.map(([jid]) => jid));
    }
};

