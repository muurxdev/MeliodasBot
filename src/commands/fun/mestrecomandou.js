/**
 * Comando .mestrecomandou — O Mestre Meliodas mandou: .mestrecomandou
 */
module.exports = {
    name: "mestrecomandou",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "O Mestre Meliodas mandou: .mestrecomandou",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const ordens = [
                "O Mestre Mandou: Ficar em silêncio por 2 minutos no grupo!",
                "O Mestre Mandou: Reagir com 🍺 na mensagem anterior!",
                "O Mestre Mandou: Chamar o Hawk de Mestre dos Limpadores!",
                "O Mestre Mandou: Mandar uma figurinha animada agora!"
            ];
            return reply(`👑 *O MESTRE MANDOU*\n\n👉 *${ordens[Math.floor(Math.random() * ordens.length)]}*`);
        }
};
