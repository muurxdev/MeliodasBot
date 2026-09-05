/**
 * Comando .jurosbanco — Calcula o rendimento acumulado da sua poupança: .jurosbanco <saldo> <meses>
 */
module.exports = {
    name: "jurosbanco",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Calcula o rendimento acumulado da sua poupança: .jurosbanco <saldo> <meses>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const saldo = parseFloat(args[0]) || 1000;
            const meses = parseInt(args[1]) || 6;
            const rend = saldo * Math.pow(1.01, meses) - saldo;
            return reply(`📈 *SIMULAÇÃO DE RENDIMENTOS*\n\nSaldo base: 💰 ${saldo}\nMeses: ${meses}\nLucro projetado em juros: *+💰 ${rend.toFixed(2)} moedas*!`);
        }
};
