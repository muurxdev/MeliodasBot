/**
 * Comando .minerardiamante — Minera nas cavernas profundas de Vaizel: .minerardiamante
 */
module.exports = {
    name: "minerardiamante",
    aliases: [],
    category: "economy",
    subcategory: "Mineração",
    description: "Minera nas cavernas profundas de Vaizel: .minerardiamante",
    cooldownMs: 3500,
    execute: async ({ reply }) => {
            const achou = Math.random() > 0.4;
            if (achou) {
                const qtd = Math.floor(Math.random() * 5) + 1;
                return reply(`💎 *MINERAÇÃO BEM-SUCEDIDA!*\n\nSua picareta faiscou na rocha pura...\nVocê extraiu *${qtd} Diamante(s) Bruto(s)* (+💰 ${qtd * 600} moedas)!`);
            } else {
                return reply(`⛏️ Você minerou por horas mas só encontrou cascalho e carvão comum.`);
            }
        }
};
