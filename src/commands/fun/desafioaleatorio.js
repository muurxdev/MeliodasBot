/**
 * Comando .desafioaleatorio — Lança um desafio relâmpago para agitar o chat: .desafioaleatorio
 */
module.exports = {
    name: "desafioaleatorio",
    aliases: [],
    category: "fun",
    subcategory: "Social",
    description: "Lança um desafio relâmpago para agitar o chat: .desafioaleatorio",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const d = [
                "Digite o alfabeto inteiro de trás pra frente sem errar!",
                "Envie o emoji mais bizarro do seu teclado agora!",
                "Fale uma frase sem usar a letra 'A'!",
                "Mande um trava-línguas em áudio de 5 segundos!"
            ];
            return reply(`⚡ *DESAFIO RELÂMPAGO DO BOAR HAT*\n\n👉 *${d[Math.floor(Math.random() * d.length)]}*`);
        }
};
