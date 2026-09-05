/**
 * Comando .quizquimica — Pergunta sobre a tabela periódica dos elementos: .quizquimica
 */
module.exports = {
    name: "quizquimica",
    aliases: [],
    category: "fun",
    subcategory: "Quiz",
    description: "Pergunta sobre a tabela periódica dos elementos: .quizquimica",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Qual é o símbolo químico do Ouro?", a: "Au" },
                { q: "Qual é o metal que se encontra em estado líquido em temperatura ambiente?", a: "Mercúrio (Hg)" },
                { q: "Qual elemento possui o número atômico 1?", a: "Hidrogênio (H)" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`🧪 *QUIZ DE QUÍMICA*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta:* ||${q.a}||`);
        }
};
