/**
 * Comando .apostacavalo — Aposta nos cavalos de guerra de Vaizel: .apostacavalo <1-4> <aposta>
 */
module.exports = {
    name: "apostacavalo",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Aposta nos cavalos de guerra de Vaizel: .apostacavalo <1-4> <aposta>",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            const escolha = parseInt(args[0]) || 1;
            const aposta = parseInt(args[1]) || 100;
            const vencedor = Math.floor(Math.random() * 4) + 1;
            const cavalos = ["Trovão Negro", "Pégaso Branco", "Fúria Ruiva", "Tempestade Prateada"];
            let res = `🏇 *CORRIDA DE CAVALOS DE VAIZEL*\n\nVencedor: *${cavalos[vencedor - 1]}* (Cavalo #${vencedor})\n\n`;
            if (escolha === vencedor) {
                res += `🎉 *CRAVOU O RESULTADO!* Você embolsou 💰 *${aposta * 3} moedas* (3x)!`;
            } else {
                res += `Seu cavalo cansou na última curva. Tente novamente!`;
            }
            return reply(res);
        }
};
