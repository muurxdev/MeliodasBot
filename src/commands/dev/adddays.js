/**
 * Comando .adddays — Adiciona dias a uma data: .adddays <dias> [YYYY-MM-DD]
 */
module.exports = {
    name: "adddays",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Adiciona dias a uma data: .adddays <dias> [YYYY-MM-DD]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const dias = parseInt(args[0]);
            if (isNaN(dias)) return reply("Uso: `.adddays <numero_dias> [data]`");
            const base = args[1] ? new Date(args[1]) : new Date();
            base.setDate(base.getDate() + dias);
            return reply(`📅 *Nova data (+${dias} dias):* *${base.toISOString().split("T")[0]}*`);
        }
};
