/**
 * Comando .nomehacker — Codinome hacker
 */
module.exports = {
    name: "nomehacker",
    aliases: ["Wolf","Byte","X","Storm","Kernel","Void","Blade","Net","Core","0x"],
    category: "fun",
    subcategory: "Diversão",
    description: "Codinome hacker",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
    const A = ["hackername","nickhacker"];
    const B = ["Dark","Cyber","Null","Ghost","Neo","Byte","Root","Zero","Shadow","Crypt"];
    const nome = A[Math.floor(Math.random()*A.length)] + B[Math.floor(Math.random()*B.length)];
    return reply("💻 *Codinome hacker:* " + '*' + nome + '*');
  }
};
