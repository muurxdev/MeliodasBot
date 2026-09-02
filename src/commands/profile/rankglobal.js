/**
 * MeliodasBot — Comando .rankglobal
 * Exibe o Ranking Global de Nível e XP unificado de todos os grupos (Top 50)
 */

const dataService = require("../../services/dataService");
const { getCargo } = require("../../utils/helpers");

module.exports = {
    name: "rankglobal",
    aliases: ["topglobal", "rankingglobal", "globalrank", "top50"],
    category: "profile",
    description: "Exibe o Top 50 usuários com maior nível e XP global de todos os grupos",
    cooldownMs: 4000,
    execute: async ({ reply, args }) => {
        const ranking = dataService.userRepo.getTopRank(50);

        if (ranking.length === 0) {
            return reply("🏆 Nenhum usuário registrado no ranking global ainda.");
        }

        let doc = `╔══════════════════════════════╗\n`
        doc += `║   🌍 *TOP 50 RANKING GLOBAL* 🌍   ║\n`
        doc += `╚══════════════════════════════╝\n\n`
        doc += `👑 _Os 50 maiores aventureiros de todos os grupos:_\n\n`
        const mentions = [];

        ranking.forEach((user, i) => {
            const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i < 10 ? "⭐" : "🔹");
            const cargo = getCargo(user[1].level);
            mentions.push(user[0]);

            doc += medalha + " *#" + (i + 1) + "* @" + user[0].split("@")[0] + " — *Nv." + user[1].level + "* (" + (user[1].xp || 0).toLocaleString("pt-BR") + " XP) | 💰 " + (user[1].coins || 0).toLocaleString("pt-BR") + " Coins\n";
        });

        doc += "\n📊 *Total de Jogadores no Top 50:* " + ranking.length + "\n";
        doc += "💡 _Consulte seu dossiê individual:_ \`.dossie\`";

        await reply(doc.trim(), mentions);
    }
};
