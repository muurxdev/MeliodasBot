/**
 * Comando .quizsdsdificil — Pergunta nível experiente sobre a lore de Nanatsu no Taizai: .quizsdsdificil
 */
module.exports = {
    name: "quizsdsdificil",
    aliases: [],
    category: "fun",
    subcategory: "Quiz SDS",
    description: "Pergunta nível experiente sobre a lore de Nanatsu no Taizai: .quizsdsdificil",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const quizes = [
                { q: "Qual é a cidade natal de Merlin, cujos sábios foram aniquilados?", a: "Belialuin" },
                { q: "Qual é o verdadeiro nome do 3º Rei das Fadas, conhecido como King?", a: "Harlequin" },
                { q: "Quem entregou o Tesouro Sagrado Rhitta para Escanor?", a: "Rei Bartra / Merlin" }
            ];
            const q = quizes[Math.floor(Math.random() * quizes.length)];
            return reply(`👑 *QUIZ SDS (DIFÍCIL)*\n\n❓ *Pergunta:* ${q.q}\n▫️ *Resposta:* ||${q.a}||`);
        }
};
