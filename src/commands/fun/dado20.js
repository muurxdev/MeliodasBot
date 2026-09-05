/**
 * Comando .dado20 — Rola um dado de 20 faces (D20 clássico de RPG)
 */
module.exports = {
    name: "dado20",
    aliases: ["rolardado"],
    category: "fun",
    subcategory: "Jogos",
    description: "Rola um dado de 20 faces (D20 clássico de RPG)",
    cooldownMs: 1500,
    execute: async ({ reply, sender }) => {
            const roll = Math.floor(Math.random() * 20) + 1;
            let comment = '';
            if (roll === 20) comment = '🔥 *SUCESSO DECISIVO / CRÍTICO!*';
            else if (roll === 1) comment = '💀 *FALHA CRÍTICA!* O destino zombou de você.';
            else if (roll >= 15) comment = '✨ *Ótimo resultado!*';
            else if (roll >= 10) comment = '👍 *Resultado moderado.*';
            else comment = '⚠️ *Resultado fraco.*';
            return reply(`🎲 *ROLAGEM D20*\n\n🎯 *Resultado:* [ *${roll}* ] / 20\n\n${comment}`);
        }
};
