/**
 * Comando .nomeempresa — Nome de empresa/startup
 */
module.exports = {
    name: "nomeempresa",
    aliases: ["ify","Lab","Hub","ly","Soft","Sys","Wave","Corp","Flow"],
    category: "fun",
    subcategory: "Diversão",
    description: "Nome de empresa/startup",
    cooldownMs: 1500,
    execute: async ({ reply }) => {
    const A = ["startupname","nomestartup"];
    const B = ["Tech","Data","Cloud","Net","Byte","Nova","Smart","Info","Digi","Meta"];
    const nome = A[Math.floor(Math.random()*A.length)] + B[Math.floor(Math.random()*B.length)];
    return reply("🏢 *Nome de empresa/startup:* " + '*' + nome + '*');
  }
};
