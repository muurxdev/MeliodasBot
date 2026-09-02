/**
 * MeliodasBot — Jogo de Damas Interativo (Checkers)
 * Tabuleiro 8x8 com coordenadas e captura de peças
 */

const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const logger = require('../../core/logger')

// Map<from, CheckersGame>
const damaGames = new Map()

class CheckersGame {
    constructor(playerWhite, playerBlack, isBot = false) {
        this.playerWhite = playerWhite // ⚪
        this.playerBlack = playerBlack // 🔴
        this.isBot = isBot
        this.turn = 'W' // W = White (inicia), B = Black
        this.board = this.initBoard()
    }

    initBoard() {
        // 8x8: null, 'w' (peça branca), 'W' (dama branca), 'b' (peça preta), 'B' (dama preta)
        const b = Array(8).fill(null).map(() => Array(8).fill(null))
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) b[r][c] = 'b'
            }
        }
        for (let r = 5; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) b[r][c] = 'w'
            }
        }
        return b
    }

    render() {
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        let str = '   ' + letters.join('  ') + '\n'
        for (let r = 0; r < 8; r++) {
            str += `${8 - r} `
            for (let c = 0; c < 8; c++) {
                const cell = this.board[r][c]
                if (cell === 'w') str += '⚪'
                else if (cell === 'W') str += '👑'
                else if (cell === 'b') str += '🔴'
                else if (cell === 'B') str += '🔥'
                else str += (r + c) % 2 === 1 ? '⬛' : '⬜'
            }
            str += ` ${8 - r}\n`
        }
        str += '   ' + letters.join('  ')
        return str
    }

    parseCoord(coord) {
        if (!coord || coord.length < 2) return null
        const col = coord.charCodeAt(0) - 97 // 'a' -> 0
        const row = 8 - parseInt(coord[1])    // '8' -> 0
        if (col < 0 || col > 7 || row < 0 || row > 7) return null
        return { row, col }
    }

    makeMove(fromStr, toStr, playerJid) {
        const from = this.parseCoord(fromStr)
        const to = this.parseCoord(toStr)
        if (!from || !to) return { success: false, msg: 'Coordenadas inválidas. Use ex: .dama c3-d4' }

        const piece = this.board[from.row][from.col]
        if (!piece) return { success: false, msg: 'Não há nenhuma peça na casa de origem.' }

        const isWhite = piece === 'w' || piece === 'W'
        if (this.turn === 'W' && !isWhite) return { success: false, msg: 'É a vez das peças Brancas (⚪).' }
        if (this.turn === 'B' && isWhite) return { success: false, msg: 'É a vez das peças Pretas (🔴).' }

        if (this.board[to.row][to.col] !== null) {
            return { success: false, msg: 'A casa de destino já está ocupada.' }
        }

        const dRow = to.row - from.row
        const dCol = Math.abs(to.col - from.col)

        // Movimento simples
        const forward = isWhite ? -1 : 1
        if (dCol === 1 && (piece.toUpperCase() === piece ? Math.abs(dRow) === 1 : dRow === forward)) {
            this.board[to.row][to.col] = piece
            this.board[from.row][from.col] = null
            // Coroação a Dama
            if (isWhite && to.row === 0) this.board[to.row][to.col] = 'W'
            if (!isWhite && to.row === 7) this.board[to.row][to.col] = 'B'

            this.turn = this.turn === 'W' ? 'B' : 'W'
            return { success: true, capture: false }
        }

        // Movimento de Captura (salto de 2 casas)
        if (dCol === 2 && Math.abs(dRow) === 2) {
            const midRow = (from.row + to.row) / 2
            const midCol = (from.col + to.col) / 2
            const midPiece = this.board[midRow][midCol]

            if (!midPiece) return { success: false, msg: 'Não há peça adversária para capturar no salto.' }
            const isMidWhite = midPiece === 'w' || midPiece === 'W'
            if (isWhite === isMidWhite) return { success: false, msg: 'Você não pode capturar sua própria peça!' }

            // Executa captura
            this.board[to.row][to.col] = piece
            this.board[midRow][midCol] = null
            this.board[from.row][from.col] = null

            // Coroação
            if (isWhite && to.row === 0) this.board[to.row][to.col] = 'W'
            if (!isWhite && to.row === 7) this.board[to.row][to.col] = 'B'

            this.turn = this.turn === 'W' ? 'B' : 'W'
            return { success: true, capture: true }
        }

        return { success: false, msg: 'Movimento inválido para esta peça de damas.' }
    }

    countPieces() {
        let white = 0, black = 0
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === 'w' || this.board[r][c] === 'W') white++
                if (this.board[r][c] === 'b' || this.board[r][c] === 'B') black++
            }
        }
        return { white, black }
    }
}

module.exports = {
    name: 'dama',
    aliases: ['damas', 'checkers'],
    category: 'fun',
    description: 'Jogue Damas interativo com coordenadas (.dama @usuario ou .dama c3-d4)',
    cooldownMs: 1000,
    execute: async ({ from, sender, args, info, reply }) => {
        const sub = (args[0] || '').toLowerCase()
        const game = damaGames.get(from)

        // Cancelar jogo
        if (sub === 'sair' || sub === 'cancelar' || sub === 'reset') {
            if (!game) return reply('❌ Nenhuma partida de Damas ativa neste grupo.')
            damaGames.delete(from)
            return reply('🛑 *Partida de Damas cancelada com sucesso!*')
        }

        // Movimento (ex: .dama c3-d4 ou .dama c3 d4)
        if (sub.includes('-') || (args[0] && args[1])) {
            if (!game) return reply('❌ Nenhuma partida em andamento. Inicie com: *.dama @usuario* ou *.dama bot*')

            const isWhiteTurn = game.turn === 'W'
            const currentJid = isWhiteTurn ? game.playerWhite : game.playerBlack

            if (currentJid !== sender && !(game.isBot && !isWhiteTurn)) {
                return reply(`⚠️ Não é a sua vez! Vez de quem está jogando com as ${isWhiteTurn ? 'Brancas (⚪)' : 'Pretas (🔴)'}.`)
            }

            let parts = sub.includes('-') ? sub.split('-') : [args[0], args[1]]
            const fromPos = parts[0].trim().toLowerCase()
            const toPos = parts[1].trim().toLowerCase()

            const moveRes = game.makeMove(fromPos, toPos, sender)
            if (!moveRes.success) {
                return reply(`❌ *Jogada inválida:* ${moveRes.msg}`)
            }

            const count = game.countPieces()
            if (count.white === 0 || count.black === 0) {
                damaGames.delete(from)
                const winnerJid = count.black === 0 ? game.playerWhite : game.playerBlack
                const winnerLabel = count.black === 0 ? '⚪ Brancas' : '🔴 Pretas'

                const pWin = initializeUser(winnerJid)
                pWin.xp = (pWin.xp || 0) + 300
                pWin.coins = (pWin.coins || 0) + 500
                dataService.saveUser(pWin)

                return reply(`🏆 *VITÓRIA NAS DAMAS!*\n\n${winnerLabel} (@${winnerJid.split('@')[0]}) eliminaram todas as peças adversárias!\n💰 *+500 Coins* | ⭐ *+300 XP* concedidos!`, [winnerJid])
            }

            const nextTurnLabel = game.turn === 'W' ? '⚪ Brancas (@' + game.playerWhite.split('@')[0] + ')' : '🔴 Pretas (@' + game.playerBlack.split('@')[0] + ')'

            let statusDoc = `╔══════════════════════════════╗\n`
            statusDoc += `║     👑 *JOGO DE DAMAS* 👑     ║\n`
            statusDoc += `╚══════════════════════════════╝\n\n`
            statusDoc += '```\n' + game.render() + '\n```\n\n'
            statusDoc += `👉 *Vez de:* ${nextTurnLabel}\n`
            statusDoc += `📊 *Peças:* ⚪ ${count.white} | 🔴 ${count.black}\n`
            statusDoc += `💡 _Para jogar:_ \`.dama <origem>-<destino>\` (Ex: \`.dama c3-d4\`)`

            return reply(statusDoc, [game.playerWhite, game.playerBlack].filter(j => j && j.includes('@')))
        }

        // Iniciar nova partida
        if (game) {
            return reply(`⚠️ Já há uma partida de Damas ativa!\n\n\`\`\`\n${game.render()}\n\`\`\`\n\n💡 Use: *.dama <origem>-<destino>* ou *.dama reset*`)
        }

        const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const isVsBot = sub === 'bot' || !mentioned
        const playerWhite = sender
        const playerBlack = isVsBot ? 'BOT@s.whatsapp.net' : mentioned

        const newGame = new CheckersGame(playerWhite, playerBlack, isVsBot)
        damaGames.set(from, newGame)

        let startDoc = `╔══════════════════════════════╗\n`
        startDoc += `║     👑 *JOGO DE DAMAS* 👑     ║\n`
        startDoc += `╚══════════════════════════════╝\n\n`
        startDoc += `⚔️ ⚪ @${playerWhite.split('@')[0]} *VS* 🔴 ${isVsBot ? '🤖 MeliodasBot' : '@' + playerBlack.split('@')[0]}\n\n`
        startDoc += '```\n' + newGame.render() + '\n```\n\n'
        startDoc += `👉 *Início:* ⚪ Brancas (@${playerWhite.split('@')[0]})\n`
        startDoc += `💡 _Faça sua jogada:_ \`.dama c3-d4\` ou \`.dama e3-f4\``

        return reply(startDoc, [playerWhite, playerBlack].filter(j => j && j.includes('@')))
    }
}

