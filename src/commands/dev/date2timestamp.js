/**
 * Comando .date2timestamp — Gera timestamp unix da data atual ou especificada: .date2timestamp [YYYY-MM-DD]
 */
module.exports = {
    name: "date2timestamp",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Gera timestamp unix da data atual ou especificada: .date2timestamp [YYYY-MM-DD]",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const dateStr = args[0];
            const d = dateStr ? new Date(dateStr) : new Date();
            if (isNaN(d.getTime())) return reply("❌ Data inválida. Formato: YYYY-MM-DD");
            return reply(`⏱️ *Timestamp Unix:*\n▫️ Segundos: *${Math.floor(d.getTime() / 1000)}*\n▫️ Milissegundos: *${d.getTime()}*`);
        }
};
