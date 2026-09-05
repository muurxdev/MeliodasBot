/**
 * Comando .xadrez / .chess / .xadrezonline
 * Jogo de xadrez simplificado
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "xadrez",
    aliases: ["chess", "xadrezonline"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogo de xadrez contra o bot (simplificado)",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();

        const board = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜'],
            ['⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛'],
            ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜'],
            ['⬜', '⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬛'],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];

        let display = "╔══════════════════════════════╗\n";
        display += "║   ♚ *XADREZ* ♔   ║\n";
        display += "╚══════════════════════════════╝\n\n";

        for (const row of board) {
            display += row.join('') + '\n';
        }

        display += "\n⚪ *Você:* Peças brancas\n";
        display += "⚫ *Bot:* Peças pretas\n\n";
        display += "💡 *Como jogar:*\n";
        display += "• Rei (♚/♔): 1 casa qualquer direção\n";
        display += "• Rainha (♛/♕): qualquer direção\n";
        display += "• Torre (♜/♖): horizontal/vertical\n";
        display += "• Bispo (♝/♗): diagonal\n";
        display += "• Cavalo (♞/♘): em L\n";
        display += "• Peão (♟/♙): 1 casa frente, captura diagonal\n\n";
        display += `_Jogo em desenvolvimento! Em breve completo._\n`;
        display += `👑 *${botName}*`;

        return reply(display.trim());
    }
};
