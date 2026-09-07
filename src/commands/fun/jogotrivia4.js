/**
 * Comando .jogotrivia4 — Quiz e minigame interativo para o grupo #4: .jogotrivia4
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 */

module.exports = {
    name: "jogotrivia4",
    aliases: ["jogo4","jogo-4"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz e minigame interativo para o grupo #4: .jogotrivia4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎮 *SALA DE JOGOS & TRIVIA*\n\nDesafio de raciocínio, curiosidades e competição de pontos entre membros.\n\n▫️ *Identificador:* #4\n▫️ *Categoria:* FUN / Jogos & Quizzes\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.jogotrivia4` para consultar métricas e dados.";
        return reply(doc);
    }
};
