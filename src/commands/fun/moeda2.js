/**
 * Comando .moeda2 — Cara ou coroa rápido (sem aposta)
 */
module.exports = {
    name: "moeda2",
    aliases: ["headsortails"],
    category: "fun",
    subcategory: "Diversão",
    description: "Cara ou coroa rápido (sem aposta)",
    cooldownMs: 1500,
    execute: async ({ reply }) => { const r=Math.random()<0.5?'🪙 *CARA*':'👑 *COROA*'; return reply('🪙 Joguei a moeda...\n\n'+r+'!'); }
};
