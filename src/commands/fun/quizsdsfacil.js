/**
 * Comando .quizsdsfacil — Pergunta nível fácil sobre Os Sete Pecados Capitais: .quizsdsfacil
 */
module.exports = {
    name: "quizsdsfacil",
    aliases: [],
    category: "fun",
    subcategory: "Quiz SDS",
    description: "Pergunta nível fácil sobre Os Sete Pecados Capitais: .quizsdsfacil",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Qual é o animal que representa o pecado de Meliodas?", a: "Dragão" },
                { q: "Qual é o nome do porquinho falante que acompanha Meliodas?", a: "Hawk" },
                { q: "Qual é o nome da taverna itinerante de Meliodas?", a: "Boar Hat (Chapéu de Javali)" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`🐉 *QUIZ SDS (FÁCIL)*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta:* ||${q.a}||`);
        }
};
