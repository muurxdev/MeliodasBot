/**
 * Comando .emprestimoreal — Simula um empréstimo com a Tesouraria de Liones: .emprestimoreal <valor>
 */
module.exports = {
    name: "emprestimoreal",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Simula um empréstimo com a Tesouraria de Liones: .emprestimoreal <valor>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const val = parseInt(args[0]);
            if (isNaN(val) || val <= 0) return reply("🏛️ *Tesouraria Real de Liones*\nUso: `.emprestimoreal <valor>`\nEx: `.emprestimoreal 5000`");
            const juros = Math.round(val * 0.12);
            return reply(`🏛️ *PROPOSTA DE EMPRÉSTIMO REAL*\n\n▫️ Valor Solicitado: 💰 ${val.toLocaleString('pt-BR')} moedas\n▫️ Taxa Real: 12% ao mês\n▫️ Custo dos Juros: 💰 ${juros.toLocaleString('pt-BR')}\n▫️ *Total a Quitar:* 💰 ${(val + juros).toLocaleString('pt-BR')}\n\n*Aprovado pelo Rei Bartra!*`);
        }
};
