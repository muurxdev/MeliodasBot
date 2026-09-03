/**
 * Comando .memoria / .jogomemoria / .memory
 * Jogo da memória com pares de emojis no chat
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "memoria",
    aliases: ["jogomemoria", "memory", "cartas-memoria"],
    category: "fun",
    description: "Exibe um grid de memória decorativo para sortear no chat",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const emojis = ["🐉", "🦊", "👑", "🗡️", "☀️", "💎"];
        const grid = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

        const card = renderCard({
            title: "JOGO DA MEMÓRIA DE BRITÂNIA",
            icon: "🃏",
            subtitle: `👤 *Desafiante:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "TABULEIRO DE CARTAS",
                    icon: "🎴",
                    fields: [
                        `[ 1 ] ❓  [ 2 ] ❓  [ 3 ] ❓  [ 4 ] ❓`,
                        `[ 5 ] ❓  [ 6 ] ❓  [ 7 ] ❓  [ 8 ] ❓`,
                        `[ 9 ] ❓  [10 ] ❓  [11 ] ❓  [12 ] ❓`
                    ]
                },
                {
                    title: "COMO JOGAR",
                    icon: "📜",
                    fields: [
                        "• Memorize a posição dos pares de cartas!",
                        "• O bot sorteia desafios no grupo para faturar XP!",
                        "• Pares: Dragão 🐉, Raposa 🦊, Rei 👑, Espada 🗡️, Sol ☀️, Diamante 💎"
                    ]
                }
            ],
            tip: "Grid decorativo — jogo interativo em breve!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

