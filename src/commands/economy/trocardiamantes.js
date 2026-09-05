/**
 * Comando .trocardiamantes — Converte diamantes em moedas de ouro: .trocardiamantes <qtd>
 */
module.exports = {
    name: "trocardiamantes",
    aliases: [],
    category: "economy",
    subcategory: "Mercado",
    description: "Converte diamantes em moedas de ouro: .trocardiamantes <qtd>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const qtd = parseInt(args[0]) || 1;
            const ganho = qtd * 550;
            return reply(`💎➡️🪙 *CÂMBIO DE JÓIAS*\n\nVocê trocou *${qtd} Diamante(s)* por 💰 *${ganho.toLocaleString('pt-BR')} Moedas de Ouro* na joalheria de Liones!`);
        }
};
