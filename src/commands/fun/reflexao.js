/**
 * Comando .reflexao — Uma reflexão do dia
 */
module.exports = {
    name: "reflexao",
    aliases: ["pensamento","reflexoes"],
    category: "fun",
    subcategory: "Poesia",
    description: "Uma reflexão do dia",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const R=['Nem tudo que conta pode ser contado.','O tempo que você gosta de perder não é tempo perdido.','Comparar-se é roubar a própria alegria.','O silêncio também é uma resposta.','A pressa é inimiga da profundidade.']; return reply('🌌 *REFLEXÃO:*\n\n'+R[Math.floor(Math.random()*R.length)]); }
};
