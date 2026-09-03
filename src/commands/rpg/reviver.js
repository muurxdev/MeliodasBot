/**
 * Comando .reviver / .lagrimadadeusa
 * Revive um aliado ou restaura toda a estamina e HP sem penalidade
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "reviver",
    aliases: ["lagrimadadeusa", "ressuscitar", "revive", "curaancestral"],
    category: "rpg",
    description: "Usa a Lágrima da Deusa para restaurar HP total e reviver parceiros",
    cooldownMs: 4000,
    execute: async ({ reply, sender }) => {
        const botName = getBotName();
        const senderNum = sender.split("@")[0].split(":")[0];
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   💧 *LÁGRIMA DA DEUSA* 💧   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *A energia vital de @${senderNum} foi 100% restaurada!* Toda penalidade de morte foi anulada.\n\n`;
        doc += `👑 *${botName}*`;
        return reply(doc.trim(), [sender]);
    }
};

