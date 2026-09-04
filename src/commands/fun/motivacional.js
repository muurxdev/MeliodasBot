/**
 * Comando .motivacional — Uma frase motivacional aleatória
 */
module.exports = {
    name: "motivacional",
    aliases: [],
    category: "fun",
    subcategory: "Poesia",
    description: "Uma frase motivacional aleatória",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const M=['Grandes jornadas começam com um único commit.','Falhar é só um teste que ainda não passou.','Disciplina supera motivação em dias difíceis.','Você não precisa ser perfeito, precisa continuar.','Um passo por dia ainda é progresso.']; return reply('🔥 *MOTIVAÇÃO:*\n\n"'+M[Math.floor(Math.random()*M.length)]+'"'); }
};
