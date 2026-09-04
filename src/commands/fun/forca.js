/**
 * Comando .forca
 * Jogo da Forca com RESPOSTA LIVRE (envie a letra/palavra no chat, sem precisar
 * de `.forca <letra>`), via interactionService. Modo com prefixo mantido.
 */

const interactionService = require("../../services/interactionService");

const forcaGames = new Map();

const WORDS = [
    { word: "MELIODAS", hint: "Capitão dos Sete Pecados Capitais" },
    { word: "ESCANOR", hint: "O Pecado do Orgulho do Leão" },
    { word: "BAN", hint: "A Raposa da Ganância imortal" },
    { word: "ELIZABETH", hint: "A Deusa apaixonada por Meliodas" },
    { word: "ZELDRIS", hint: "Irmão de Meliodas e Mandamento da Piedade" },
    { word: "EXCALIBUR", hint: "Espada sagrada dos reis de Britannia" },
    { word: "BRITANNIA", hint: "O reino principal onde se passa a história" },
    { word: "WHATSAPP", hint: "O aplicativo de mensagens onde o bot roda" },
    { word: "PROGRAMACAO", hint: "A arte de criar códigos e softwares" },
    { word: "JAVASCRIPT", hint: "A linguagem do Node.js" }
];

const norm = (s) => (s || "").toUpperCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
const mask = (g) => g.word.split("").map(l => g.guessedLetters.has(l) ? l : "_").join(" ");

/** Processa um palpite (letra ou palavra). Retorna { consumed, msg }. */
function processGuess(from, input) {
    const game = forcaGames.get(from);
    if (!game) return { consumed: false, msg: null };
    const val = norm(input);
    if (!val || !/^[A-Z]+$/.test(val)) return { consumed: false, msg: null };

    // Palavra completa
    if (val.length > 1) {
        // só trata como chute de palavra se tiver o tamanho da palavra secreta
        if (val.length !== game.word.length) return { consumed: false, msg: null };
        if (val === game.word) {
            forcaGames.delete(from);
            return { consumed: true, msg: `🎉 *VITÓRIA!*\n\n👑 Palavra: *${game.word}*!\n💡 Digite \`.forca\` para jogar de novo.` };
        }
        game.lives -= 2;
        if (game.lives <= 0) {
            forcaGames.delete(from);
            return { consumed: true, msg: `☠️ *FIM DE JOGO!*\n💥 A palavra era: *${game.word}*.` };
        }
        return { consumed: true, msg: `❌ *Palavra incorreta!* -2 vidas.\n❤️ Vidas: ${game.lives}` };
    }

    // Letra
    const letter = val;
    if (game.guessedLetters.has(letter)) {
        return { consumed: true, msg: `⚠️ A letra *${letter}* já foi tentada. Tente outra.` };
    }
    game.guessedLetters.add(letter);
    if (game.word.includes(letter)) {
        const m = mask(game);
        if (!m.includes("_")) {
            forcaGames.delete(from);
            return { consumed: true, msg: `🎉 *VITÓRIA!*\n🏆 Palavra: *${game.word}*!\n💡 Digite \`.forca\` para jogar de novo.` };
        }
        return { consumed: true, msg: `✅ *Boa!* A letra *${letter}* existe!\n🔤 \`${m}\`\n❤️ Vidas: ${game.lives}` };
    }
    game.lives -= 1;
    if (game.lives <= 0) {
        forcaGames.delete(from);
        return { consumed: true, msg: `☠️ *FIM DE JOGO!*\n💥 A palavra era: *${game.word}*.` };
    }
    return { consumed: true, msg: `❌ *Errou!* A letra *${letter}* não está na palavra.\n🔤 \`${mask(game)}\`\n❤️ Vidas: ${game.lives}` };
}

function startGame(from, sender, reply) {
    const picked = WORDS[Math.floor(Math.random() * WORDS.length)];
    const game = { word: picked.word, hint: picked.hint, guessedLetters: new Set(), lives: 6, starter: sender };
    forcaGames.set(from, game);

    interactionService.register(from, {
        type: "forca",
        ttlMs: 180000,
        onText: async (text, c) => {
            const { consumed, msg } = processGuess(from, text);
            if (!consumed) return false;
            if (!forcaGames.has(from)) c.clear();
            await c.reply(msg);
            return true;
        }
    });

    let doc = `╔══════════════════════════════╗\n`;
    doc += `║       🪢 *JOGO DA FORCA* 🪢      ║\n`;
    doc += `╚══════════════════════════════╝\n\n`;
    doc += `💡 *Dica:* ${game.hint}\n`;
    doc += `🔤 *Palavra:* \`${mask(game)}\` (${game.word.length} letras)\n`;
    doc += `❤️ *Vidas:* ${"❤️".repeat(game.lives)}\n\n`;
    doc += `👉 _Responda no chat com uma *letra* ou a *palavra* inteira._`;
    return reply(doc.trim());
}

module.exports = {
    name: "forca",
    aliases: ["hangman", "jogodaforca"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogo da Forca — responda com a letra ou a palavra no chat",
    execute: async ({ from, args, sender, reply }) => {
        const input = (args && args[0]) ? args[0] : "";
        if (!forcaGames.has(from) || norm(input) === "NOVO" || norm(input) === "INICIAR") {
            return startGame(from, sender, reply);
        }
        if (input) {
            const { consumed, msg } = processGuess(from, input);
            if (consumed) {
                if (!forcaGames.has(from)) interactionService.clear(from);
                return reply(msg);
            }
        }
        // sem palpite válido: mostra o estado atual
        const game = forcaGames.get(from);
        return reply(`🪢 *Forca ativa!*\n💡 *Dica:* ${game.hint}\n🔤 \`${mask(game)}\`\n❤️ Vidas: ${game.lives}\n👉 _Responda com uma letra ou a palavra._`);
    }
};
