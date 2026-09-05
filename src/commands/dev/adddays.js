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
            // Sem esta checagem, uma data inválida ("teste") fazia o toISOString()
            // abaixo estourar com RangeError: Invalid time value.
            if (isNaN(base.getTime())) {
                return reply("❌ *Data inválida:* `" + args[1] + "`\n\n📌 Use o formato `AAAA-MM-DD`. Ex.: `.adddays 10 2026-09-05`\n💡 Sem data, eu uso a de hoje.");
            }
            base.setDate(base.getDate() + dias);
            return reply(`📅 *Nova data (+${dias} dias):* *${base.toISOString().split("T")[0]}*`);
        }
};
