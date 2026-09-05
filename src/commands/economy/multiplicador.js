/**
 * Comando .multiplicador — Calcula valor pós-multiplicador de eventos: .multiplicador <valor> <fator>
 */
module.exports = {
    name: "multiplicador",
    aliases: [],
    category: "economy",
    subcategory: "Finanças",
    description: "Calcula valor pós-multiplicador de eventos: .multiplicador <valor> <fator>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const v = parseFloat(args[0]) || 100, f = parseFloat(args[1]) || 2;
            return reply(`✖️ *Cálculo de Multiplicação:*\n${v} × ${f} = *${(v * f).toFixed(2)}*`);
        }
};
