/**
 * Comando .quizbiblico — Pergunta sobre passagens e figuras bíblicas: .quizbiblico
 */
module.exports = {
    name: "quizbiblico",
    aliases: [],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre passagens e figuras bíblicas: .quizbiblico",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Quem construiu a arca para escapar do grande dilúvio?", a: "Noé" },
                { q: "Qual jovem pastor derrotou o gigante Golias com uma funda?", a: "Davi" },
                { q: "Quantos apóstolos principais Jesus escolheu?", a: "12" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`📖 *QUIZ BÍBLICO*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta oculta:* ||${q.a}||`);
        }
};
