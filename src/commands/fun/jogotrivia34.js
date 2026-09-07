/**
 * Comando .jogotrivia34 — Quiz e minigame interativo para o grupo #34: .jogotrivia34
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 */

module.exports = {
    name: "jogotrivia34",
    aliases: ["jogo34","jogo-34"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz e minigame interativo para o grupo #34: .jogotrivia34",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎮 *SALA DE JOGOS & TRIVIA*\n\nDesafio de raciocínio, curiosidades e competição de pontos entre membros.\n\n▫️ *Identificador:* #34\n▫️ *Categoria:* FUN / Jogos & Quizzes\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.jogotrivia34` para consultar métricas e dados.";
        return reply(doc);
    }
};
