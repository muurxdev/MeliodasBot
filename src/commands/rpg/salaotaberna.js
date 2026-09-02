/**
 * MeliodasBot — Comando .salaotaberna / .chapeudejavali
 * Descanso na Taberna Chapéu de Javali com banquete de Meliodas
 */

const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "salaotaberna",
    aliases: ["chapeudejavali", "taberna", "banquetetaberna", "descansar"],
    category: "rpg",
    description: "Descansa no Chapéu de Javali e recupera energia com a comida de Meliodas",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🍻 *CHAPÉU DE JAVALI* 🍻   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🍖 *Banquete servido pelo Capitão Meliodas!*\n`;
        doc += `(A comida tem uma aparência incrível mas o gosto é péssimo 😂)\n\n`;
        doc += `✨ Sua estamina e energia foram 100% restauradas!\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

