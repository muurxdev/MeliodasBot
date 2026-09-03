/**
 * Comando .forcaanime
 * Jogo da forca temático com personagens e armas de animes
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "forcaanime",
    aliases: ["animeforca", "jogoforcaanime", "otakuforca"],
    category: "fun",
    description: "Jogo da forca temático com personagens e armas de animes",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "JOGO DA FORCA: PERSONAGEM ANIME",
        icon: "🪢",
        subtitle: "🎭 *Tema: Nanatsu no Taizai*",
        sections: [
            {
                title: "PALAVRA OCULTA",
                icon: "❓",
                fields: [
                    "Palavra: `_ E _ I O _ A _`",
                    "Dica: O Dragão da Ira líder dos Sete Pecados"
                ]
            }
        ],
        tip: "Envie uma letra ou tente adivinhar o nome completo!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
