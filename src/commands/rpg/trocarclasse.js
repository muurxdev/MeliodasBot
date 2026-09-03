/**
 * Comando .trocarclasse / .resetclasse
 * Reatribuição de classe e redistribuição de maestria
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "trocarclasse",
    aliases: ["resetclasse", "mudarclasse", "redefinirclasse"],
    category: "rpg",
    description: "Permite redefinir sua classe principal e redistribuir pontos",
    cooldownMs: 4000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🔄 *MUDANÇA DE CLASSE* 🔄   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `⚔️ *Classes Disponíveis para Transição:*\n`;
        doc += `• 🛡️ Paladino Sagrado\n`;
        doc += `• 🔮 Mago Arcano\n`;
        doc += `• 🗡️ Assassino das Sombras\n`;
        doc += `• 🏹 Arqueiro Élfico\n\n`;
        doc += `💡 _Para confirmar a troca, use:_ \`.classe <nome>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

