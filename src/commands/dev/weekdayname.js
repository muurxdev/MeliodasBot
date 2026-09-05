/**
 * Comando .weekdayname — Retorna o dia da semana de qualquer data: .weekdayname YYYY-MM-DD
 */
module.exports = {
    name: "weekdayname",
    aliases: [],
    category: "dev",
    subcategory: "Data",
    description: "Retorna o dia da semana de qualquer data: .weekdayname YYYY-MM-DD",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            const raw = args[0];
            const d = raw ? new Date(raw) : new Date();
            if (isNaN(d.getTime())) return reply("Uso: `.weekdayname <AAAA-MM-DD>`");
            const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
            return reply(`📅 A data *${d.toISOString().split("T")[0]}* cai em um(a) *${dias[d.getUTCDay()]}*.`);
        }
};
