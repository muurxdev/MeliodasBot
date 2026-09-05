/**
 * Comando .sorteiogrupo — Sorteia um número da sorte de 1 a N: .sorteiogrupo [máximo=100]
 */
module.exports = {
    name: "sorteiogrupo",
    aliases: [],
    category: "general",
    subcategory: "Sorteio",
    description: "Sorteia um número da sorte de 1 a N: .sorteiogrupo [máximo=100]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const max = Math.max(2, parseInt(args[0]) || 100);
            const sorteado = Math.floor(Math.random() * max) + 1;
            return reply(`🎲🎉 *SORTEIO REAL DE BRITANNIA*\n\nFaixa: 1 a ${max}\n🏆 *NÚMERO SORTEADO:* 🔥 *[ ${sorteado} ]* 🔥\n\nParabéns ao vencedor!`);
        }
};
