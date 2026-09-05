/**
 * Comando .mandamentopureza — Testa o Mandamento da Pureza (fraudrin/derieri): .mandamentopureza
 */
module.exports = {
    name: "mandamentopureza",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Pureza (fraudrin/derieri): .mandamentopureza",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🕊️ *MANDAMENTO DA PUREZA*\n\n▫️ Qualquer um que cometer atos impuros ou desonrosos em combate sofrerá o julgamento moral, tendo seus membros amortecidos.`);
        }
};
