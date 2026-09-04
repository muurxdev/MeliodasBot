/**
 * Comando .nomeelfo — Nome élfico
 */
module.exports = {
    name: "nomeelfo",
    aliases: ["driel","wen","as","brimbor","wë","dir","loth","riel","dan","ith"],
    category: "fun",
    subcategory: "Diversão",
    description: "Nome élfico",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
    const A = ["elfname","nomeelfico"];
    const B = ["Ela","Gala","Legol","Thranduil","Ari","Cele","Fin","Elro","Aer","Nim"];
    const nome = A[Math.floor(Math.random()*A.length)] + B[Math.floor(Math.random()*B.length)];
    return reply("🧝 *Nome élfico:* " + '*' + nome + '*');
  }
};
