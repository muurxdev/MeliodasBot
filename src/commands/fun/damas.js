/**
 * Comando .damas / .checkers / .damasamericana
 * Jogo de damas americano simplificado
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "damas",
    aliases: ["checkers", "damasamericana"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogo de damas americano simplificado contra o bot",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();

        const board = [
            ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜'],
            ['⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛'],
            ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜'],
            ['⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛'],
            ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜'],
            ['⬜', '🔴', '⬜', '🔴', '⬜', '🔴', '⬜', '🔴'],
            ['🔴', '⬜', '🔴', '⬜', '🔴', '⬜', '🔴', '⬜'],
            ['⬜', '🔴', '⬜', '🔴', '⬜', '🔴', '⬜', '🔴']
        ];

        let display = "╔══════════════════════════════╗\n";
        display += "║   🎲 *DAMAS AMERICANAS* 🎲   ║\n";
        display += "╚══════════════════════════════╝\n\n";

        for (const row of board) {
            display += row.join('') + '\n';
        }

        display += "\n🔴 *Você:* Peças vermelhas\n";
        display += "⚫ *Bot:* Peças pretas\n\n";
        display += "💡 *Como jogar:*\n";
        display += "• Move peças na diagonal\n";
        display += "• Pule sobre peças inimigas para capturar\n";
        display += "• Chegue ao final para virar Dama (👑)\n\n";
        display += `_Jogo em desenvolvimento! Em breve completo._\n`;
        display += `👑 *${botName}*`;

        return reply(display.trim());
    }
};
