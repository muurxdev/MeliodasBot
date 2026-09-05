/**
 * Comando .xpgroup / .xpg / .xpgrupo
 * Exibe o XP acumulado em grupos (farm passivo)
 */

const dataService = require("../../services/dataService");
const { initializeUser, barraXP, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "xpgroup",
    aliases: ["xpg", "xpgrupo", "xpgrupos", "xpfarm"],
    category: "general",
    subcategory: "XP & Progressão",
    description: "Exibe seu XP acumulado em grupos (farm passivo por mensagens)",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const farmGrupoMsgs = user.messagesGroup || 0;
        const farmGrupoXp = user.xpGroup || 0;
        const farmComandos = user.commandsGroup || 0;
        const level = user.level || 1;
        const currentXp = user.xp || 0;
        const maxXp = calcularXpNecessario(level);
        const barra = barraXP(currentXp, level);
        const cargo = getCargo(level);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   📊 *XP EM GRUPOS* 📊   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 🌐 FARM GRUPAL 〕━⬣\n";
        doc += "┃ 💬 *Mensagens no Grupo:* " + farmGrupoMsgs.toLocaleString('pt-BR') + "\n";
        doc += "┃ ⌨️ *Comandos no Grupo:* " + farmComandos.toLocaleString('pt-BR') + "\n";
        doc += "┃ ✨ *XP Ganho em Grupos:* " + farmGrupoXp.toLocaleString('pt-BR') + " XP\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 📈 PROGRESSO TOTAL 〕━⬣\n";
        doc += "┃ 📊 *Nível:* " + level + " " + barra + "\n";
        doc += "┃ ⭐ *XP Atual:* " + currentXp.toLocaleString('pt-BR') + " / " + maxXp.toLocaleString('pt-BR') + " XP\n";
        doc += "┃ 💼 *Patente:* " + cargo + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 _XP é ganho automaticamente ao enviar mensagens em grupos!_\n";
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
