/**
 * Comando .subdays — Subtrai dias de uma data: .subdays <dias> [YYYY-MM-DD]
 */
module.exports = {
    name: "subdays",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Subtrai dias de uma data: .subdays <dias> [YYYY-MM-DD]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const dias = parseInt(args[0]);
            if (isNaN(dias)) return reply("Uso: `.subdays <numero_dias> [data]`");
            const base = args[1] ? new Date(args[1]) : new Date();
            base.setDate(base.getDate() - dias);
            return reply(`📅 *Nova data (-${dias} dias):* *${base.toISOString().split("T")[0]}*`);
        }
};
