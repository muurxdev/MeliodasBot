/**
 * Comando .mandamentoverdade — Testa a maldição do Mandamento da Verdade (Galand): .mandamentoverdade
 */
module.exports = {
    name: "mandamentoverdade",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa a maldição do Mandamento da Verdade (Galand): .mandamentoverdade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🗿 *MANDAMENTO DA VERDADE (Galand)*\n\n"Qualquer um que mentir na minha presença será petrificado para toda a eternidade!"\n⚠️ Regra absoluta: Se contar uma falsidade, seu corpo se transformará em pedra maciça instantaneamente.`);
        }
};
