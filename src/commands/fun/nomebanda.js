/**
 * Comando .nomebanda — Nome de banda
 */
module.exports = {
    name: "nomebanda",
    aliases: ["Vermelhos","Sonâmbulos","Elétricos","do Caos","Perdidos","Imortais"],
    category: "fun",
    subcategory: "Diversão",
    description: "Nome de banda",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
    const A = ["bandname","gerarbanda"];
    const B = ["Os ","The ","Banda ","Projeto ","Legião ","Império "];
    const nome = A[Math.floor(Math.random()*A.length)] + B[Math.floor(Math.random()*B.length)];
    return reply("🎸 *Nome de banda:* " + '*' + nome + '*');
  }
};
