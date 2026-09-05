/**
 * Comando .timestamp2date — Converte timestamp unix (ms ou s) para data legível: .timestamp2date <timestamp>
 */
module.exports = {
    name: "timestamp2date",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Converte timestamp unix (ms ou s) para data legível: .timestamp2date <timestamp>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            let ts = parseInt(args[0]);
            if (isNaN(ts)) return reply("Uso: `.timestamp2date <timestamp>`");
            if (ts < 10000000000) ts *= 1000;
            const d = new Date(ts);
            return reply(`📅 *Timestamp:* ${ts}\nData UTC: *${d.toUTCString()}*\nData Local: *${d.toLocaleString("pt-BR")}*`);
        }
};
