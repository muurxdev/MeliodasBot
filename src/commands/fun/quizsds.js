/**
 * Comando .quizsds — Pergunta de conhecimentos sobre Nanatsu no Taizai com resposta
 */
module.exports = {
    name: "quizsds",
    aliases: [],
    category: "fun",
    subcategory: "Jogos",
    description: "Pergunta de conhecimentos sobre Nanatsu no Taizai com resposta",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const questions = [
                { q: 'Qual é o pecado cometido por Meliodas na lore?', a: 'Pecado da Ira do Dragão.' },
                { q: 'Em qual horário o poder de Escanor atinge o ápice absoluto "The One"?', a: 'Exatamente ao Meio-Dia.' },
                { q: 'Qual é o nome da espada quebrada que Meliodas carregava no início?', a: 'Fragmento do Caixão da Eterna Escuridão.' },
                { q: 'Quantas transformações a Lança Espiritual Chastiefol possui?', a: '10 formas distintas.' },
                { q: 'Qual clã foi selado pela união das 4 raças há 3.000 anos?', a: 'O Clã dos Demônios.' },
                { q: 'Qual é a raça biológica de Hawk?', a: 'Ele é uma criatura nativa do Purgatório.' }
            ];
            const item = questions[Math.floor(Math.random() * questions.length)];
            return reply(`⚔️ *QUIZ DOS SETE PECADOS CAPITAIS*\n\n❓ *Pergunta:* ${item.q}\n\n\n||💡 *Resposta Correta:* ${item.a}||`);
        }
};
