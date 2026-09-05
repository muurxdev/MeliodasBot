/**
 * Comando .corujaquiz — Pergunta rápida da Coruja Sábia: .corujaquiz
 */
module.exports = {
    name: "corujaquiz",
    aliases: [],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta rápida da Coruja Sábia: .corujaquiz",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply("🦉 *DESAFIO DA CORUJA SÁBIA*\n\nO que é, o que é?\nQuanto mais se tira, maior ele fica?\n\n▫️ *Resposta:* ||Um buraco!||");
        }
};
