/**
 * Comando .rank / .top / .ranking
 * Rankings separados para Grupo, Privado (PV) e Geral Global com persistência SQLite
 */

const dataService = require("../../services/dataService");
const { getCargo } = require("../../utils/helpers");
const groupAuthService = require("../../services/groupAuthService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "rank",
    aliases: ["top", "leaderboard", "rankgrupo", "topgrupo", "rankpv", "rankgeral"],
    category: "profile",
    description: "Exibe os rankings separados de Grupo, Privado (PV) ou Geral Global",
    cooldownMs: 2500,
    execute: async ({ reply, from, isGroup, args, sender }) => {
        const botName = getBotName();
        const mode = (args[0] || "").toLowerCase().trim();

        // 1. RANKING DO PRIVADO (PV)
        if (mode === "pv" || mode === "dm" || mode === "privado") {
            const xpData = dataService.getXpData(); // ranking por métrica composta: varre todos
            const rankingPv = Object.entries(xpData)
                .filter(([_, u]) => (u.xp_pv || u.xpPv || 0) > 0 || (u.commands_pv || u.commandsPv || 0) > 0)
                .sort((a, b) => {
                    const totalA = (a[1].xp_pv || a[1].xpPv || 0) + ((a[1].commands_pv || a[1].commandsPv || 0) * 10);
                    const totalB = (b[1].xp_pv || b[1].xpPv || 0) + ((b[1].commands_pv || b[1].commandsPv || 0) * 10);
                    return totalB - totalA;
                })
                .slice(0, 10);

            if (rankingPv.length === 0) {
                return reply("🏆 Nenhum farm no PV registrado no momento.");
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📱 *TOP 10 RANKING DO PRIVADO (PV)* 📱   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingPv.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                mentions.push(jid);
                const pvXp = u.xp_pv || u.xpPv || 0;
                const pvCmds = u.commands_pv || u.commandsPv || 0;
                const pvCoins = u.coins_pv || u.coinsPv || 0;

                doc += `${medal} *#${i + 1}* @${jid.split("@")[0]}\n`;
                doc += `⭐ *XP no PV:* ${pvXp.toLocaleString("pt-BR")} XP | 💬 *Comandos:* ${pvCmds}\n`;
                if (pvCoins > 0) doc += `💰 *Coins no PV:* ${pvCoins.toLocaleString("pt-BR")} Coins\n`;
                doc += `\n`;
            });

            doc += `💡 _Rankings de PV e Grupos são 100% separados para equilíbrio!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // 2. RANKING GERAL / GLOBAL — ordenado por nível DESC, xp DESC (usa índice)
        if (mode === "geral" || mode === "global" || !isGroup) {
            const rankingGlobal = dataService.userRepo.getTopRank(10);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👑 *TOP 10 RANKING GERAL GLOBAL* 👑   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingGlobal.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                const cargo = getCargo(u.level || 1);
                mentions.push(jid);

                doc += `${medal} *#${i + 1}* @${jid.split("@")[0]} [Nv. ${u.level || 1}]\n`;
                doc += `⭐ *XP:* ${(u.xp || 0).toLocaleString("pt-BR")} | 💰 *Coins:* ${(u.coins || 0).toLocaleString("pt-BR")}\n`;
                doc += `🎖️ *Patente:* ${cargo} ${u.rebirthCount ? `(🌀 ${u.rebirthCount}x Rebirth)` : ""}\n\n`;
            });

            doc += `💡 _Para ver o ranking exclusivo deste grupo:_ \`.rank grupo\` | _Ranking no PV:_ \`.rank pv\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // 3. RANKING EXCLUSIVO DO GRUPO ATUAL
        let participantsList = null;
        try {
            const groupData = await groupAuthService.getGroupData(from);
            if (groupData?.participants && groupData.participants.length > 0) {
                participantsList = new Set(groupData.participants.map(p => p.id.split(":")[0].split("@")[0]));
            }
        } catch (_) {}

        const xpData = dataService.getXpData(); // ranking filtrado por membros do grupo: varre todos
        const rankingGrupo = Object.entries(xpData)
            .filter(([jid]) => {
                if (!participantsList) return true;
                const cleanJid = jid.split(":")[0].split("@")[0];
                return participantsList.has(cleanJid);
            })
            .sort((a, b) => {
                const totalA = ((a[1].level || 1) * 10000) + (a[1].xp || 0);
                const totalB = ((b[1].level || 1) * 10000) + (b[1].xp || 0);
                return totalB - totalA;
            })
            .slice(0, 10);

        if (rankingGrupo.length === 0) {
            return reply("🏆 Nenhum participante deste grupo registrado no ranking ainda.");
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *TOP 10 RANKING DESTE GRUPO* 🏆   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        const mentions = [];

        rankingGrupo.forEach(([jid, u], i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
            const cargo = getCargo(u.level || 1);
            mentions.push(jid);

            doc += `${medal} *#${i + 1}* @${jid.split("@")[0]}\n`;
            doc += `📈 *Nível:* ${u.level || 1} | ⭐ *XP:* ${(u.xp || 0).toLocaleString("pt-BR")}\n`;
            doc += `💬 *Mensagens:* ${(u.messages || 0).toLocaleString("pt-BR")} | 💰 *Coins:* ${(u.coins || 0).toLocaleString("pt-BR")}\n`;
            doc += `🎖️ *Patente:* ${cargo}\n\n`;
        });

        doc += `💡 _Ver Ranking Global:_ \`.rank geral\` | _Ver Ranking no PV:_ \`.rank pv\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), mentions);
    }
};
