/**
 * MeliodasBot — Comando .arenarank / .ranqueada
 * Ranqueada competitiva com Ligas (Bronze, Prata, Ouro, Mestre, Desafiante)
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

const LEAGUES = [
    { name: "🥉 Bronze", minElo: 0, reward: "1.000 coins" },
    { name: "🥈 Prata", minElo: 1000, reward: "3.000 coins" },
    { name: "🥇 Ouro", minElo: 2000, reward: "7.000 coins" },
    { name: "💎 Diamante", minElo: 3500, reward: "15.000 coins" },
    { name: "👑 Desafiante Mestre", minElo: 5000, reward: "35.000 coins" }
];

module.exports = {
    name: "arenarank",
    aliases: ["ranqueada", "ligas", "pvprank", "elo"],
    category: "rpg",
    description: "Exibe sua liga competitiva, ELO e tabela de classificação da Arena",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { level: 1 };
        const elo = (user.level || 1) * 80 + 200;

        const curLeague = LEAGUES.slice().reverse().find(l => elo >= l.minElo) || LEAGUES[0];

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *ARENA RANQUEADA DE ELITE* 🏆   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚔️ *Sua Liga:* ${curLeague.name}\n`;
        doc += `🔥 *Pontuação ELO:* ${elo.toLocaleString("pt-BR")} Pontos\n\n`;
        doc += `╭━〔 🏅 TABELA DE DIVISÕES 〕━⬣\n`;
        LEAGUES.forEach(l => {
            doc += `┃ ${l.name}: a partir de ${l.minElo} ELO (Recompensa: ${l.reward})\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};