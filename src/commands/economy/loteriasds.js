/**
 * Comando .loteriasds — Aposta na Loteria dos Sete Pecados: .loteriasds <num1> <num2> <num3>
 */
module.exports = {
    name: "loteriasds",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Aposta na Loteria dos Sete Pecados: .loteriasds <num1> <num2> <num3>",
    cooldownMs: 3000,
    execute: async ({ reply, args }) => {
            if (args.length < 3) return reply("🎰 *Loteria dos Sete Pecados*\nEscolha 3 números de 1 a 10:\nUso: `.loteriasds 3 7 9`");
            const apostas = args.slice(0, 3).map(Number);
            const sorteados = [
                Math.floor(Math.random() * 10) + 1,
                Math.floor(Math.random() * 10) + 1,
                Math.floor(Math.random() * 10) + 1
            ];
            const acertos = apostas.filter(n => sorteados.includes(n)).length;
            return reply(`🎰 *SORTEIO DA LOTERIA SDS*\n\n▫️ Seus números: [${apostas.join(', ')}]\n▫️ Sorteados: [${sorteados.join(', ')}]\n▫️ Acertos: *${acertos}/3*\n\n${acertos === 3 ? "🏆 JACKPOT MÁXIMO! Você ganhou 50.000 moedas!" : acertos > 0 ? "✨ Parabéns, você ganhou um prêmio de consolação!" : "Sem acertos dessa vez. Tente novamente!"}`);
        }
};
