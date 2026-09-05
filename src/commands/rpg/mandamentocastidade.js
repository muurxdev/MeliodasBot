/**
 * Comando .mandamentocastidade — Testa o Mandamento da Castidade (Derieri): .mandamentocastidade
 */
module.exports = {
    name: "mandamentocastidade",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Castidade (Derieri): .mandamentocastidade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🥊 *MANDAMENTO DA CASTIDADE (Derieri)*\n\n▫️ Pureza em ação e retidão corporal. Aquele que sucumbir a impulsos impuros é atingido por enfermidades fulminantes.`);
        }
};
