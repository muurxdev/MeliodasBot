/**
 * Comando .nivelira — Mede o nível de fúria interior do Dragão: .nivelira
 */
module.exports = {
    name: "nivelira",
    aliases: [],
    category: "profile",
    subcategory: "Status",
    description: "Mede o nível de fúria interior do Dragão: .nivelira",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            const f = Math.floor(Math.random() * 100) + 1;
            return reply(`🐉🔥 *TERMÔMETRO DA IRA*\nNível de Fúria Interior: *${f}%*!\n${f > 80 ? "⚠️ CUIDADO! O dragão está prestes a despertar o Modo Assalto!" : "Tranquilo como uma tarde ensolarada no Boar Hat."}`);
        }
};
