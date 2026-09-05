/**
 * Comando .tributoreino — Calcula imposto de importação de mercadorias no reino: .tributoreino <valor>
 */
module.exports = {
    name: "tributoreino",
    aliases: [],
    category: "economy",
    subcategory: "Finanças",
    description: "Calcula imposto de importação de mercadorias no reino: .tributoreino <valor>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const v = parseFloat(args[0]) || 1000;
            const imposto = v * 0.07;
            return reply(`👑 *TRIBUTO REAL DE BRITANNIA*\n\nValor declarado: 💰 ${v.toFixed(2)}\nAlíquota da Coroa (7%): *💰 ${imposto.toFixed(2)}*\nValor líquido pós-imposto: 💰 ${(v - imposto).toFixed(2)}`);
        }
};
