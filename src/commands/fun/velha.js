/**
 * MeliodasBot — Jogo da Velha Interativo (Tic-Tac-Toe)
 * Suporte a 1v1 entre membros ou contra o Bot com persistência de XP e moedas
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

// Map<from, { playerX, playerO, board, turn, isBot, lastMove }>
const games = new Map()

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
]

function renderBoard(board) {
    const numEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
    const getIcon = (val, idx) => {
        if (val === 'X') return '❌'
        if (val === 'O') return '⭕'
        return numEmojis[idx]
    }

    let b = ''
    b += ` ${getIcon(board[0], 0)} │ ${getIcon(board[1], 1)} │ ${getIcon(board[2], 2)}\n`
    b += `────┼────┼────\n`
    b += ` ${getIcon(board[3], 3)} │ ${getIcon(board[4], 4)} │ ${getIcon(board[5], 5)}\n`
    b += `────┼────┼────\n`
    b += ` ${getIcon(board[6], 6)} │ ${getIcon(board[7], 7)} │ ${getIcon(board[8], 8)}`
    return b
}

function checkWinner(board) {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]
        }
    }
    if (board.every(cell => cell !== null)) {
        return 'DRAW'
    }
    return null
}

function botBestMove(board) {
    // 1. Tenta vencer
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O'
            if (checkWinner(board) === 'O') {
                board[i] = null
                return i
            }
            board[i] = null
        }
    }
    // 2. Bloqueia vitória do jogador
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'X'
            if (checkWinner(board) === 'X') {
                board[i] = null
                return i
            }
            board[i] = null
        }
    }
    // 3. Pega o centro se livre
    if (board[4] === null) return 4
    // 4. Pega cantos
    const corners = [0, 2, 6, 8].filter(c => board[c] === null)
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)]
    }
    // 5. Qualquer disponível
    const avail = board.map((v, i) => v === null ? i : null).filter(v => v !== null)
    return avail[Math.floor(Math.random() * avail.length)]
}

module.exports = {
    name: 'velha',
    aliases: ['jogodavelha', 'tictactoe', 'ttt'],
    category: 'fun',
    description: 'Jogue Jogo da Velha contra outro membro (@usuario) ou contra o Bot (.velha bot)',
    cooldownMs: 1000,
    execute: async ({ from, sender, args, info, isGroup, reply, client }) => {
        const sub = (args[0] || '').toLowerCase()
        const game = games.get(from)

        // Cancelar jogo
        if (sub === 'sair' || sub === 'cancelar' || sub === 'reset') {
            if (!game) return reply('❌ Não há nenhuma partida de Jogo da Velha em andamento neste grupo.')
            if (game.playerX !== sender && game.playerO !== sender && !game.isBot) {
                return reply('❌ Apenas os jogadores da partida podem cancelá-la.')
            }
            games.delete(from)
            return reply('🛑 *Partida de Jogo da Velha cancelada!*')
        }

        // Se for um movimento numérico (1 a 9)
        const movePos = parseInt(sub)
        if (!isNaN(movePos) && movePos >= 1 && movePos <= 9) {
            if (!game) {
                return reply('❌ Nenhuma partida ativa. Inicie com: *.velha @usuario* ou *.velha bot*')
            }

            const isPlayerTurn = (game.turn === 'X' && game.playerX === sender) || (game.turn === 'O' && game.playerO === sender)
            if (!isPlayerTurn) {
                return reply(`⚠️ Não é a sua vez! Aguarde a jogada de quem está no turno atual.`)
            }

            const cellIdx = movePos - 1
            if (game.board[cellIdx] !== null) {
                return reply('⚠️ Esta posição já foi preenchida! Escolha um número livre.')
            }

            // Executa a jogada
            game.board[cellIdx] = game.turn
            let winner = checkWinner(game.board)

            if (!winner && game.isBot && game.turn === 'X') {
                // Jogada da IA
                const botMove = botBestMove(game.board)
                if (botMove !== undefined && botMove !== null) {
                    game.board[botMove] = 'O'
                    winner = checkWinner(game.board)
                }
            } else if (!winner) {
                game.turn = game.turn === 'X' ? 'O' : 'X'
            }

            // Fim de jogo?
            if (winner) {
                games.delete(from)
                let endMsg = `╔══════════════════════════════╗\n`
                endMsg += `║     🎮 *JOGO DA VELHA* 🎮     ║\n`
                endMsg += `╚══════════════════════════════╝\n\n`
                endMsg += renderBoard(game.board) + '\n\n'

                if (winner === 'DRAW') {
                    endMsg += `⚖️ *EMPATE!* A partida terminou sem vencedores.\n⭐ +25 XP para ambos!`
                    const p1 = initializeUser(game.playerX)
                    p1.xp = (p1.xp || 0) + 25
                    dataService.saveUser(p1)
                    if (!game.isBot) {
                        const p2 = initializeUser(game.playerO)
                        p2.xp = (p2.xp || 0) + 25
                        dataService.saveUser(p2)
                    }
                    return reply(endMsg)
                }

                const winnerJid = winner === 'X' ? game.playerX : game.playerO
                const winnerName = (winner === 'O' && game.isBot) ? '🤖 MeliodasBot' : `@${winnerJid.split('@')[0]}`

                endMsg += `🏆 *VITÓRIA!* ${winnerName} venceu a partida!\n`
                endMsg += `💰 *+200 Coins* | ⭐ *+150 XP* concedidos ao vencedor!`

                if (winnerJid && !(winner === 'O' && game.isBot)) {
                    const uWin = initializeUser(winnerJid)
                    uWin.xp = (uWin.xp || 0) + 150
                    uWin.coins = (uWin.coins || 0) + 200
                    uWin.wins = (uWin.wins || 0) + 1
                    dataService.saveUser(uWin)
                }

                return reply(endMsg, [game.playerX, game.playerO].filter(j => j && j.includes('@')))
            }

            // Jogo continua: Mostra tabuleiro
            const nextTurnJid = game.turn === 'X' ? game.playerX : game.playerO
            const nextTurnName = (game.turn === 'O' && game.isBot) ? '🤖 MeliodasBot' : `@${nextTurnJid.split('@')[0]}`

            let statusMsg = `╔══════════════════════════════╗\n`
            statusMsg += `║     🎮 *JOGO DA VELHA* 🎮     ║\n`
            statusMsg += `╚══════════════════════════════╝\n\n`
            statusMsg += renderBoard(game.board) + '\n\n'
            statusMsg += `👉 *Vez de:* ${nextTurnName} (${game.turn === 'X' ? '❌' : '⭕'})\n`
            statusMsg += `💡 _Digite_ \`.velha <1-9>\` _para jogar!_`

            return reply(statusMsg, [game.playerX, game.playerO].filter(j => j && j.includes('@')))
        }

        // Início de Nova Partida
        if (game) {
            return reply(`⚠️ Já existe uma partida em andamento neste grupo!\n💡 Digite *.velha <1-9>* para jogar ou *.velha reset* para encerrar.`)
        }

        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const isVsBot = sub === 'bot' || sub === 'ia' || !mentioned

        const playerX = sender
        const playerO = isVsBot ? 'BOT@s.whatsapp.net' : mentioned

        if (!isVsBot && playerO === playerX) {
            return reply('❌ Você não pode jogar contra si mesmo! Marque outro usuário ou jogue contra o bot com: *.velha bot*')
        }

        const newGame = {
            playerX,
            playerO,
            board: Array(9).fill(null),
            turn: 'X',
            isBot: isVsBot,
            createdAt: Date.now()
        }
        games.set(from, newGame)

        const opponentLabel = isVsBot ? '🤖 *MeliodasBot*' : `@${playerO.split('@')[0]}`

        let startMsg = `╔══════════════════════════════╗\n`
        startMsg += `║     🎮 *JOGO DA VELHA* 🎮     ║\n`
        startMsg += `╚══════════════════════════════╝\n\n`
        startMsg += `⚔️ @${playerX.split('@')[0]} (❌) *VS* ${opponentLabel} (⭕)\n\n`
        startMsg += renderBoard(newGame.board) + '\n\n'
        startMsg += `👉 *Primeira jogada:* @${playerX.split('@')[0]} (❌)\n`
        startMsg += `💡 _Digite_ \`.velha 1\` _a_ \`.velha 9\` _para marcar a casa!_`

        return reply(startMsg, [playerX, playerO].filter(j => j && j.includes('@')))
    }
}
