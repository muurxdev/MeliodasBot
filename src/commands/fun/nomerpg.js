/**
 * Comando .nomerpg — Nome de RPG
 */
module.exports = {
    name: "nomerpg",
    aliases: ["gorn","wyn","dor","thas","iel","rok","mir","vok","lyn","ric"],
    category: "fun",
    subcategory: "Diversão",
    description: "Nome de RPG",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
    const A = ["gerarnomerpg","nomeguerreiro"];
    const B = ["Thor","Kael","Dra","Mor","Zar","Vay","Gron","Lyr","Fen","Ald"];
    const nome = A[Math.floor(Math.random()*A.length)] + B[Math.floor(Math.random()*B.length)];
    return reply("⚔️ *Nome de RPG:* " + '*' + nome + '*');
  }
};
