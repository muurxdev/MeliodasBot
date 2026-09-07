/**
 * Comando .jogotrivia15 — Quiz e minigame interativo para o grupo #15: .jogotrivia15
 * Categoria: fun | Subcategoria: Jogos & Quizzes
 */

module.exports = {
    name: "jogotrivia15",
    aliases: ["jogo15","jogo-15"],
    category: "fun",
    subcategory: "Jogos & Quizzes",
    description: "Quiz e minigame interativo para o grupo #15: .jogotrivia15",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🎮 *SALA DE JOGOS & TRIVIA*\n\nDesafio de raciocínio, curiosidades e competição de pontos entre membros.\n\n▫️ *Identificador:* #15\n▫️ *Categoria:* FUN / Jogos & Quizzes\n▫️ *Status do Serviço:* 🟢 Operacional\n▫️ *Ativação:* `.jogotrivia15` para consultar métricas e dados.";
        return reply(doc);
    }
};
