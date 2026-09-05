/**
 * Comando .quizcapitais — Pergunta qual é a capital de um país do mundo
 */
module.exports = {
    name: "quizcapitais",
    aliases: ["pergutacapital"],
    category: "fun",
    subcategory: "Jogos",
    description: "Pergunta qual é a capital de um país do mundo",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const list = [
                { country: 'Japão', capital: 'Tóquio' },
                { country: 'França', capital: 'Paris' },
                { country: 'Canadá', capital: 'Ottawa' },
                { country: 'Austrália', capital: 'Camberra' },
                { country: 'Alemanha', capital: 'Berlim' },
                { country: 'Egito', capital: 'Cairo' },
                { country: 'Argentina', capital: 'Buenos Aires' },
                { country: 'Itália', capital: 'Roma' },
                { country: 'Espanha', capital: 'Madrid' },
                { country: 'Rússia', capital: 'Moscou' }
            ];
            const sel = list[Math.floor(Math.random() * list.length)];
            return reply(`🌍 *QUIZ GEOGRÁFICO*\n\n❓ *Qual é a capital de:* *${sel.country}*?\n\n\n||👉 *Resposta:* ${sel.capital}||`);
        }
};
