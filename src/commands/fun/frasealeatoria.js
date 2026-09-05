/**
 * Comando .frasealeatoria — Gera uma frase motivacional épica: .frasealeatoria
 */
module.exports = {
    name: "frasealeatoria",
    aliases: [],
    category: "fun",
    subcategory: "Frases",
    description: "Gera uma frase motivacional épica: .frasealeatoria",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
            const frases = [
                "Não importa o quão fundo você caia, a única direção restante é para cima!",
                "Até a escuridão mais densa é dissipada pela menor das fagulhas.",
                "Sua força não é medida pelo impacto do seu golpe, mas pela determinação em se levantar.",
                "Um verdadeiro guerreiro não luta porque odeia o que está na frente, mas porque ama o que está atrás."
            ];
            return reply(`✨ *PENSAMENTO DO DIA*\n\n"${frases[Math.floor(Math.random() * frases.length)]}"`);
        }
};
