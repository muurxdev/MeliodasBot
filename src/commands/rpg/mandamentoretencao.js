/**
 * Comando .mandamentoretencao — Testa o Mandamento do Desinteresse (Gowther Demoníaco): .mandamentoretencao
 */
module.exports = {
    name: "mandamentoretencao",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento do Desinteresse (Gowther Demoníaco): .mandamentoretencao",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🎭 *MANDAMENTO DO DESINTERESSE (Gowther Antigo)*\n\n▫️ Aquele que demonstrar cobiça ou anseio passional perderá suas lembranças e todo o senso de identidade própria.`);
        }
};
