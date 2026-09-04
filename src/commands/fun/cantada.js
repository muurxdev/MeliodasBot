/**
 * Comando .cantada — Uma cantada (nerd/leve) aleatória
 */
module.exports = {
    name: "cantada",
    aliases: ["pickup","flerte","cantadas"],
    category: "fun",
    subcategory: "Diversão",
    description: "Uma cantada (nerd/leve) aleatória",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const C=['Você é uma exceção não tratada: quebrou meu sistema.','Se beleza fosse bug, você seria um crash total.','Você deve ser CSS, porque deu estilo à minha vida.','Nosso amor é como Git: sempre volto pra você (checkout).','Você é O(1): acesso direto ao meu coração.','Me dá seu SSID? Quero me conectar em você.']; return reply('💘 *CANTADA:*\n\n'+C[Math.floor(Math.random()*C.length)]); }
};
