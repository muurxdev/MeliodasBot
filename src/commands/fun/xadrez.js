/**
 * Xadrez Interativo (Chess)
 * Tabuleiro com peças Unicode reais e notação algébrica
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

// Map<from, ChessGame>
const chessGames = new Map()

const PIECE_ICONS = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', // Brancas
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'  // Pretas
}

class ChessGame {
    constructor(playerWhite, playerBlack, isBot = false) {
        this.playerWhite = playerWhite
        this.playerBlack = playerBlack
        this.isBot = isBot
        this.turn = 'W'
        this.board = this.initBoard()
    }

    initBoard() {
        const b = Array(8).fill(null).map(() => Array(8).fill(null))
        // Peças pretas
        b[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
        b[1] = ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p']
        // Peças brancas
        b[6] = ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']
        b[7] = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        return b
    }

    render() {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        let str = '   ' + letters.join('  ') + '\n'
        for (let r = 0; r < 8; r++) {
            str += `${8 - r} `
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c]
                if (p) {
                    str += PIECE_ICONS[p] + ' '
                } else {
                    str += (r + c) % 2 === 1 ? '⬛' : '⬜'
                }
            }
            str += ` ${8 - r}\n`
        }
        str += '   ' + letters.join('  ')
        return str
    }

    parseCoord(coord) {
        if (!coord || coord.length < 2) return null
        const col = coord.charCodeAt(0) - 97
        const row = 8 - parseInt(coord[1])
        if (col < 0 || col > 7 || row < 0 || row > 7) return null
        return { row, col }
    }

    makeMove(fromStr, toStr) {
        const from = this.parseCoord(fromStr)
        const to = this.parseCoord(toStr)
        if (!from || !to) return { success: false, msg: 'Coordenadas inválidas. Use formato: .xadrez e2-e4' }

        const piece = this.board[from.row][from.col]
        if (!piece) return { success: false, msg: 'Não há nenhuma peça na casa de origem.' }

        const isWhite = piece === piece.toUpperCase()
        if (this.turn === 'W' && !isWhite) return { success: false, msg: 'É a vez das Brancas (♔).' }
        if (this.turn === 'B' && isWhite) return { success: false, msg: 'É a vez das Pretas (♚).' }

        const target = this.board[to.row][to.col]
        if (target) {
            const isTargetWhite = target === target.toUpperCase()
            if (isWhite === isTargetWhite) {
                return { success: false, msg: 'Você não pode capturar sua própria peça!' }
            }
        }

        // Executa movimento
        this.board[to.row][to.col] = piece
        this.board[from.row][from.col] = null

        // Promoção de Peão simples para Rainha
        if (piece === 'P' && to.row === 0) this.board[to.row][to.col] = 'Q'
        if (piece === 'p' && to.row === 7) this.board[to.row][to.col] = 'q'

        this.turn = this.turn === 'W' ? 'B' : 'W'
        return { success: true, capturedKing: target?.toLowerCase() === 'k' }
    }

    botBestMove() {
        const isBlackTurn = this.turn === 'B'
        if (!isBlackTurn) return null

        const candidates = []
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c]
                if (!piece || piece === piece.toUpperCase()) continue
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (r === tr && c === tc) continue
                        const target = this.board[tr][tc]
                        if (target && target === target.toUpperCase()) {
                            candidates.push({ from: [r, c], to: [tr, tc] })
                        } else if (!target) {
                            candidates.push({ from: [r, c], to: [tr, tc] })
                        }
                    }
                }
            }
        }
        if (candidates.length === 0) return null
        return candidates[Math.floor(Math.random() * candidates.length)]
    }
}

module.exports = {
    name: 'xadrez',
    aliases: ['chess'],
    category: 'fun',
    description: 'Jogue Xadrez interativo com visualizador e coordenadas (.xadrez @usuario ou .xadrez e2-e4)',
    cooldownMs: 1000,
    execute: async ({ from, sender, args, info, reply }) => {
        const sub = (args[0] || '').toLowerCase()
        const game = chessGames.get(from)

        // Cancelar jogo
        if (sub === 'sair' || sub === 'cancelar' || sub === 'reset') {
            if (!game) return reply('❌ Nenhuma partida de Xadrez em andamento neste grupo.')
            chessGames.delete(from)
            return reply('🛑 *Partida de Xadrez cancelada!*')
        }

        // Movimento (ex: .xadrez e2-e4 ou .xadrez e2 e4)
        if (sub.includes('-') || (args[0] && args[1])) {
            if (!game) return reply('❌ Nenhuma partida ativa. Inicie com: *.xadrez @usuario* ou *.xadrez bot*')

            const isWhiteTurn = game.turn === 'W'
            const currentJid = isWhiteTurn ? game.playerWhite : game.playerBlack

            if (currentJid !== sender && !(game.isBot && !isWhiteTurn)) {
                return reply(`⚠️ Não é a sua vez! Aguarde a jogada das ${isWhiteTurn ? 'Brancas (♔)' : 'Pretas (♚)'}.`)
            }

            let parts = sub.includes('-') ? sub.split('-') : [args[0], args[1]]
            const fromPos = parts[0].trim().toLowerCase()
            const toPos = parts[1].trim().toLowerCase()

            const moveRes = game.makeMove(fromPos, toPos)
            if (!moveRes.success) {
                return reply(`❌ *Movimento inválido:* ${moveRes.msg}`)
            }

            // Xeque-Mate / Rei Capturado
            if (moveRes.capturedKing) {
                chessGames.delete(from)
                const winnerJid = isWhiteTurn ? game.playerWhite : game.playerBlack
                const winnerLabel = isWhiteTurn ? '♔ Brancas' : '♚ Pretas'

                const pWin = initializeUser(winnerJid)
                pWin.xp = (pWin.xp || 0) + 500
                pWin.coins = (pWin.coins || 0) + 1000
                dataService.saveUser(pWin)

                return reply(`🏆 *XEQUE-MATE!*\n\n${winnerLabel} (@${winnerJid.split('@')[0]}) capturaram o Rei adversário!\n💰 *+1000 Coins* | ⭐ *+500 XP* concedidos ao Grão-Mestre!`, [winnerJid])
            }

            if (game.isBot && game.turn === 'B') {
                const botMove = game.botBestMove()
                if (botMove) {
                    const fromCoord = String.fromCharCode(97 + botMove.from[1]) + (8 - botMove.from[0])
                    const toCoord = String.fromCharCode(97 + botMove.to[1]) + (8 - botMove.to[0])
                    const botRes = game.makeMove(fromCoord, toCoord)
                    if (botRes.capturedKing) {
                        chessGames.delete(from)
                        return reply(`🏆 *XEQUE-MATE!*\n\n🤖 Bot (♚ Pretas) capturaram o Rei!\n💰 *+1000 Coins* | ⭐ *+500 XP* concedidos ao Bot!`)
                    }
                }
            }

            const nextLabel = game.turn === 'W' ? '♔ Brancas (@' + game.playerWhite.split('@')[0] + ')' : '♚ Pretas (@' + game.playerBlack.split('@')[0] + ')'

            let statusDoc = `╔══════════════════════════════╗\n`
            statusDoc += `║     ♟️ *PARTIDA DE XADREZ* ♟️   ║\n`
            statusDoc += `╚══════════════════════════════╝\n\n`
            statusDoc += '```\n' + game.render() + '\n```\n\n'
            statusDoc += `👉 *Vez de:* ${nextLabel}\n`
            statusDoc += `💡 _Para jogar:_ \`.xadrez <origem>-<destino>\` (Ex: \`.xadrez e2-e4\`)`

            return reply(statusDoc, [game.playerWhite, game.playerBlack].filter(j => j && j.includes('@')))
        }

        // Iniciar nova partida
        if (game) {
            return reply(`⚠️ Já existe uma partida de Xadrez ativa!\n\n\`\`\`\n${game.render()}\n\`\`\`\n\n💡 Use: *.xadrez <origem>-<destino>* ou *.xadrez reset*`)
        }

        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const isVsBot = sub === 'bot' || !mentioned
        const playerWhite = sender
        const playerBlack = isVsBot ? 'BOT@s.whatsapp.net' : mentioned

        const newGame = new ChessGame(playerWhite, playerBlack, isVsBot)
        chessGames.set(from, newGame)

        let startDoc = `╔══════════════════════════════╗\n`
        startDoc += `║     ♟️ *PARTIDA DE XADREZ* ♟️   ║\n`
        startDoc += `╚══════════════════════════════╝\n\n`
        startDoc += `⚔️ ♔ @${playerWhite.split('@')[0]} *VS* ♚ ${isVsBot ? '🤖 ' + getBotName() : '@' + playerBlack.split('@')[0]}\n\n`
        startDoc += '```\n' + newGame.render() + '\n```\n\n'
        startDoc += `👉 *Início:* ♔ Brancas (@${playerWhite.split('@')[0]})\n`
        startDoc += `💡 _Faça seu lance:_ \`.xadrez e2-e4\` ou \`.xadrez d2-d4\``

        return reply(startDoc, [playerWhite, playerBlack].filter(j => j && j.includes('@')))
    }
}

