/**
 * Comando .jogotrivia31 — Quiz e minigame interativo para o grupo #31: .jogotrivia31
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 */

module.exports = {
    name: "jogotrivia31",
    aliases: ["jogo31","jogo-31"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz e minigame interativo para o grupo #31: .jogotrivia31",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎮 *SALA DE JOGOS & TRIVIA*\n\nDesafio de raciocínio, curiosidades e competição de pontos entre membros.\n\n▫️ *Identificador:* #31\n▫️ *Categoria:* FUN / Jogos & Quizzes\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.jogotrivia31` para consultar métricas e dados.";
        return reply(doc);
    }
};
