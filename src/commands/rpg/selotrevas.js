/**
 * Comando .selotrevas / .chamasnegras
 * Liberação do Selo das Chamas Negras do Clã dos Demônios
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "selotrevas",
    aliases: ["chamasnegras", "hellblaze", "marcademonica", "purgatoriopoder"],
    category: "rpg",
    description: "Libera as chamas negras do purgatório aumentando o poder de ataque",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { coins: 0 };

        user.xp = (user.xp || 0) + 800;
        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔥 *SELO DAS CHAMAS NEGRAS* 🔥   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🌑 *As marcas demoníacas cobriram seu corpo!*\n\n`;
        doc += `╭━〔 ⚔️ PODER DO PURGATÓRIO 〕━⬣\n`;
        doc += `┃ 💥 *Ataque Físico:* +45% de Dano\n`;
        doc += `┃ 🔥 *Habilidade:* Chamas do Inferno (Hellblaze Ativo)\n`;
        doc += `┃ ⭐ *Experiência:* +800 XP\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

