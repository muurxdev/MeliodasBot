/**
 * Comando .logaritmo — Calcula logaritmo: .logaritmo <número> [base=10]
 */
module.exports = {
    name: "logaritmo",
    aliases: [],
    category: "general",
    subcategory: "Matemática",
    description: "Calcula logaritmo: .logaritmo <número> [base=10]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const x = parseFloat(args[0]);
            const base = parseFloat(args[1]) || 10;
            if (isNaN(x) || x <= 0 || isNaN(base) || base <= 0 || base === 1) return reply("❌ Número e base devem ser positivos, e base diferente de 1. Ex: `.logaritmo 100 10`");
            const res = Math.log(x) / Math.log(base);
            return reply(`🔢 *log_${base}(${x})* = *${res.toFixed(4)}*`);
        }
};
