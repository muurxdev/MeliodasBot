/**
 * Comando .jogotrivia37 — Quiz e minigame interativo para o grupo #37: .jogotrivia37
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 */

module.exports = {
    name: "jogotrivia37",
    aliases: ["jogo37","jogo-37"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz e minigame interativo para o grupo #37: .jogotrivia37",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎮 *SALA DE JOGOS & TRIVIA*\n\nDesafio de raciocínio, curiosidades e competição de pontos entre membros.\n\n▫️ *Identificador:* #37\n▫️ *Categoria:* FUN / Jogos & Quizzes\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.jogotrivia37` para consultar métricas e dados.";
        return reply(doc);
    }
};
