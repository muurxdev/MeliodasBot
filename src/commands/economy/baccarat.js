/**
 * Comando .baccarat — Joga uma mão rápida de Punto Banco / Baccarat: .baccarat [aposta]
 */
module.exports = {
    name: "baccarat",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Joga uma mão rápida de Punto Banco / Baccarat: .baccarat [aposta]",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const bet = parseInt(args[0]) || 50;
            const drawCard = () => Math.min(10, Math.floor(Math.random() * 13) + 1);
            const p1 = drawCard(), p2 = drawCard();
            const b1 = drawCard(), b2 = drawCard();
            const pTotal = (p1 + p2) % 10;
            const bTotal = (b1 + b2) % 10;
            let result = `🃏 *MESA DE BACCARAT*\n▫️ Sua aposta: 💰 ${bet}\n▫️ Suas Cartas: [${p1}, ${p2}] ➔ Pontos: *${pTotal}*\n▫️ Banca: [${b1}, ${b2}] ➔ Pontos: *${bTotal}*\n\n`;
            if (pTotal > bTotal) {
                result += `🎉 *VITÓRIA DO JOGADOR!* Você lucrou 💰 +${bet * 2} moedas!`;
            } else if (bTotal > pTotal) {
                result += `💀 *A BANCA VENCEU!* Você perdeu suas moedas apostadas.`;
            } else {
                result += `🤝 *EMPATE (ÉGALITÉ)!* Aposta devolvida intacta.`;
            }
            return reply(result);
        }
};
