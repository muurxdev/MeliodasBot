/**
 * Comando .elogio — Um elogio sincero aleatório
 */
module.exports = {
    name: "elogio",
    aliases: ["compliment","elogios"],
    category: "fun",
    subcategory: "Interação",
    description: "Um elogio sincero aleatório",
    cooldownMs: 1500,
    execute: async ({ reply, sender }) => { const E=['Sua persistência inspira quem está por perto.','Você tem um jeito único de resolver problemas.','O grupo fica melhor quando você aparece.','Sua curiosidade é um superpoder.','Você aprende rápido e ajuda os outros — raro.']; const alvo=sender?('@'+sender.split('@')[0]+' '):''; return reply('🌟 '+alvo+E[Math.floor(Math.random()*E.length)], sender?[sender]:[]); }
};
