/**
 * Comando .highcard — Duelo de maior carta contra o Barman Meliodas: .highcard [aposta]
 */
module.exports = {
    name: "highcard",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Duelo de maior carta contra o Barman Meliodas: .highcard [aposta]",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const aposta = parseInt(args[0]) || 100;
            const player = Math.floor(Math.random() * 13) + 1;
            const meliodas = Math.floor(Math.random() * 13) + 1;
            const nomes = ["", "Ás", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Valete", "Dama", "Rei"];
            let msg = `🎴 *DUELO DE MAIOR CARTA*\n\n▫️ Sua Carta: *${nomes[player]}* (${player})\n▫️ Meliodas: *${nomes[meliodas]}* (${meliodas})\n\n`;
            if (player > meliodas) {
                msg += `🎉 *VOCÊ VENCEU!* Meliodas paga 💰 *+${aposta * 2} moedas* com um sorriso no rosto!`;
            } else if (meliodas > player) {
                msg += `😈 Meliodas venceu: "Sate sate sate, o ouro agora é da taverna!"`;
            } else {
                msg += `🤝 Empate! As cartas retornam ao baralho.`;
            }
            return reply(msg);
        }
};
