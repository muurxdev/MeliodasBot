/**
 * Comando .jogodavelha / .velha / .tictactoe
 * Jogo da velha clássico
 */

const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

const games = new Map();

function createGame(player1) {
    return {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        player1: { jid: player1, symbol: 'X' },
        player2: null,
        status: 'waiting'
    };
}

function checkWinner(board) {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (const [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.every(cell => cell !== null) ? 'tie' : null;
}

function formatBoard(board) {
    const cells = board.map((cell, i) => {
        if (cell === 'X') return '❌';
        if (cell === 'O') return '⭕';
        return `${Math.floor(i/3)+1}${(i%3)+1}`;
    });
    return `┌───────┐\n│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │\n│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │\n│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │\n└───────┘`;
}

module.exports = {
    name: "jogodavelha",
    aliases: ["jdv", "jogovelha"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogue o clássico jogo da velha contra outro jogador",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply, mentionedJids }) => {
        const botName = getBotName();

        if (args[0] === 'cancelar') {
            const game = games.get(sender);
            if (game) {
                games.delete(sender);
                return reply("❌ *Jogo cancelado!*");
            }
            return reply("❌ *Você não tem um jogo em andamento.*");
        }

        if (args[0] === 'aceitar') {
            const game = games.get(sender);
            if (!game || game.status !== 'waiting') {
                return reply("❌ *Nenhum convite pendente.*");
            }
            game.player2 = { jid: sender, symbol: 'O' };
            game.status = 'playing';
            games.set(sender, game);
            return reply(`✅ *Jogo iniciado!*\n\n${formatBoard(game.board)}\n\n❌ *${game.player1.jid.split('@')[0]}* é X\n⭕ *${game.player2.jid.split('@')[0]}* é O\n\nVez de: ❌ ${game.player1.jid.split('@')[0]}`);
        }

        if (args[0] && /^\d$/.test(args[0])) {
            const game = games.get(sender);
            if (!game || game.status !== 'playing') {
                return reply("❌ *Nenhum jogo em andamento.*");
            }

            const pos = parseInt(args[0]) - 1;
            if (pos < 0 || pos > 8 || game.board[pos]) {
                return reply("❌ *Posição inválida ou ocupada!*");
            }

            const currentSymbol = game.currentPlayer;
            const currentPlayer = currentSymbol === 'X' ? game.player1.jid : game.player2.jid;

            if (sender !== currentPlayer) {
                return reply("❌ *Não é sua vez!*");
            }

            game.board[pos] = currentSymbol;

            const winner = checkWinner(game.board);
            if (winner) {
                games.delete(sender);
                if (winner === 'tie') {
                    return reply(`🤝 *EMPATE!*\n\n${formatBoard(game.board)}`);
                } else {
                    const winnerJid = winner === 'X' ? game.player1.jid : game.player2.jid;
                    return reply(`🎉 *${winnerJid.split('@')[0]} VENCEU!*\n\n${formatBoard(game.board)}`);
                }
            }

            game.currentPlayer = currentSymbol === 'X' ? 'O' : 'X';
            games.set(sender, game);

            const nextSymbol = game.currentPlayer;
            const nextPlayer = nextSymbol === 'X' ? game.player1.jid : game.player2.jid;

            return reply(`${formatBoard(game.board)}\n\nVez de: ${nextSymbol === 'X' ? '❌' : '⭕'} ${nextPlayer.split('@')[0]}\n\n💡 *Digite o número da posição (1-9) para jogar*`);
        }

        if (mentionedJids && mentionedJids.length > 0) {
            const opponent = mentionedJids[0];
            const game = createGame(sender);
            game.player2 = { jid: opponent, symbol: 'O' };
            game.status = 'playing';
            games.set(sender, game);
            return reply(`🎮 *JOGO DA VELHA*\n\n❌ *${sender.split('@')[0]}* desafiou *${opponent.split('@')[0]}*!\n\n${formatBoard(game.board)}\n\nVez de: ❌ ${sender.split('@')[0]}\n💡 *Digite o número da posição (1-9) para jogar*`);
        }

        return reply("❌ *Mencione um jogador para desafiar!*\n\n📌 *Exemplo:* `.velha @amigo`");
    }
};
