/**
 * Comando .forca
 * Jogo da Forca interativo com adivinhação de palavras
 */

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

module.exports = {
    name: "forca",
    aliases: ["hangman", "jogodaforca"],
    category: "fun",
    description: "Inicie ou jogue uma partida do clássico Jogo da Forca",
    execute: async ({ from, args, sender, reply }) => {
        let game = forcaGames.get(from);
        const input = (args && args[0]) ? args[0].toUpperCase().trim() : "";

        // Novo jogo
        if (!game || input === "NOVO" || input === "INICIAR") {
            const picked = WORDS[Math.floor(Math.random() * WORDS.length)];
            game = {
                word: picked.word,
                hint: picked.hint,
                guessedLetters: new Set(),
                lives: 6,
                starter: sender
            };
            forcaGames.set(from, game);

            const masked = game.word.split("").map(l => game.guessedLetters.has(l) ? l : "_").join(" ");

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║       🪢 *JOGO DA FORCA* 🪢      ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `💡 *Dica:* ${game.hint}\n`;
            doc += `🔤 *Palavra:* \`${masked}\` (${game.word.length} letras)\n`;
            doc += `❤️ *Vidas:* ${"❤️".repeat(game.lives)}\n\n`;
            doc += `👉 _Envie \`.forca <letra>\` para tentar uma letra ou \`.forca <palavra>\` para chutar!_`;
            return reply(doc.trim());
        }

        if (!input) {
            const masked = game.word.split("").map(l => game.guessedLetters.has(l) ? l : "_").join(" ");
            return reply(`🪢 *Jogo da Forca Ativo!*\n\n💡 *Dica:* ${game.hint}\n🔤 *Palavra:* \`${masked}\`\n❤️ *Vidas Restantes:* ${game.lives}\n👉 _Envie \`.forca <letra>\`_`);
        }

        // Chute de palavra completa
        if (input.length > 1) {
            if (input === game.word) {
                forcaGames.delete(from);
                return reply(`🎉 *VITÓRIA BRILHANTE!*\n\n👑 Você acertou a palavra completa: *${game.word}*!\n🏆 Parabéns pelo raciocínio afiado!`);
            } else {
                game.lives -= 2;
                if (game.lives <= 0) {
                    forcaGames.delete(from);
                    return reply(`☠️ *FORCA! VOCÊ PERDEU!*\n\n💥 A palavra secreta era: *${game.word}*!\n💡 Digite \`.forca\` para iniciar uma nova partida.`);
                }
                return reply(`❌ *Palavra incorreta!* Você perdeu 2 vidas.\n❤️ *Vidas restantes:* ${game.lives}`);
            }
        }

        // Chute de letra individual
        const letter = input[0];
        if (game.guessedLetters.has(letter)) {
            return reply(`⚠️ A letra *${letter}* já foi tentada antes! Tente outra letra.`);
        }

        game.guessedLetters.add(letter);

        if (game.word.includes(letter)) {
            const masked = game.word.split("").map(l => game.guessedLetters.has(l) ? l : "_").join(" ");
            const won = !masked.includes("_");

            if (won) {
                forcaGames.delete(from);
                return reply(`🎉 *VITÓRIA!*\n\n🏆 Você completou a palavra: *${game.word}*!\n💡 Parabéns pela vitória! Digite \`.forca\` para jogar de novo.`);
            }

            return reply(`✅ *Boa!* A letra *${letter}* faz parte da palavra!\n\n🔤 *Progresso:* \`${masked}\`\n❤️ *Vidas:* ${game.lives}`);
        } else {
            game.lives -= 1;
            if (game.lives <= 0) {
                forcaGames.delete(from);
                return reply(`☠️ *FORCA! FIM DE JOGO!*\n\n💥 A palavra secreta era: *${game.word}*!\n💡 Digite \`.forca\` para tentar novamente.`);
            }
            const masked = game.word.split("").map(l => game.guessedLetters.has(l) ? l : "_").join(" ");
            return reply(`❌ *Errou!* A letra *${letter}* não está na palavra.\n\n🔤 *Progresso:* \`${masked}\`\n❤️ *Vidas Restantes:* ${game.lives}`);
        }
    }
};

