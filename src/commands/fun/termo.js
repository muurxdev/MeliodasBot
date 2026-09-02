/**
 * MeliodasBot — Comando .termo / .wordle / .jogotermo
 * Jogo estilo Termo / Wordle com dicas de letras coloridas (🟩, 🟨, ⬛)
 */

const { renderCard } = require("../../utils/uiEngine");

const PALAVRAS = ["ANIME", "MANGA", "DEMON", "PECADO", "MAGIA", "ESPADA", "PODER", "REINO", "ARENA", "FORJA", "COROA", "FUSÃO", "ALMAS", "CHAMA", "DRAGÃO"];
const activeGames = new Map();

module.exports = {
    name: "termo",
    aliases: ["wordle", "jogotermo", "adivinharpalavra"],
    category: "fun",
    description: "Jogue o jogo Termo / Wordle no WhatsApp e adivinhe a palavra secreta",
    cooldownMs: 2000,
    execute: async ({ from, sender, reply, args }) => {
        const key = `${from}_${sender}`;
        const game = activeGames.get(key);

        const chute = (args[0] || "").toUpperCase().trim();

        if (!game) {
            const secret = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
            activeGames.set(key, { secret, attempts: [], maxAttempts: 6 });

            const card = renderCard({
                title: "JOGO TERMO — INICIADO",
                icon: "🟩",
                subtitle: `🎯 *Jogador:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "REGRAS DO JOGO",
                        icon: "📜",
                        fields: [
                            `• A palavra secreta possui *${secret.length} letras*.`,
                            "• Você tem *6 tentativas* para adivinhar.",
                            "• 🟩 = Letra certa na posição certa.",
                            "• 🟨 = Letra certa na posição errada.",
                            "• ⬛ = Letra não existe na palavra."
                        ]
                    }
                ],
                tip: `Digite .termo <palavra de ${secret.length} letras> para enviar seu palpite!`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (!chute || chute.length !== game.secret.length) {
            return reply(`❌ Seu palpite deve ter exatamente *${game.secret.length} letras* (ex: \`.termo ${game.secret.slice(0, 2)}...\`).`);
        }

        // Avaliar chute
        let feedback = "";
        for (let i = 0; i < chute.length; i++) {
            if (chute[i] === game.secret[i]) {
                feedback += "🟩";
            } else if (game.secret.includes(chute[i])) {
                feedback += "🟨";
            } else {
                feedback += "⬛";
            }
        }

        game.attempts.push({ chute, feedback });

        if (chute === game.secret) {
            activeGames.delete(key);
            return reply(`🎉 *PARABÉNS! VOCÊ VENCEU O TERMO!*\n\n👑 *Palavra Correta:* \`${game.secret}\`\n🎯 *Tentativas:* ${game.attempts.length}/6\n🏆 Recompensa: +500 XP & +1.000 Coins!`);
        }

        if (game.attempts.length >= game.maxAttempts) {
            const secretRevealed = game.secret;
            activeGames.delete(key);
            return reply(`❌ *FIM DE JOGO!* Você esgotou as 6 tentativas.\n\n📖 *A palavra secreta era:* \`${secretRevealed}\``);
        }

        const lines = game.attempts.map((a, idx) => `${idx + 1}. \`${a.chute}\` ➔ ${a.feedback}`).join("\n");

        return reply(`🧩 *TERMO — TENTATIVA ${game.attempts.length}/6*\n\n${lines}\n\n👉 Digite \`.termo <palavra>\` para a próxima tentativa!`);
    }
};