/**
 * Comando .mandamentofe — Testa o Mandamento da Fé (Melascula): .mandamentofe
 */
module.exports = {
    name: "mandamentofe",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Fé (Melascula): .mandamentofe",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🐍 *MANDAMENTO DA FÉ (Melascula)*\n\n"Qualquer um que perder a fé diante dos seus olhos terá a visão queimada pelas chamas negras do abismo!"\n⚠️ Os olhos dos infiéis ardem em combustão instantânea.`);
        }
};
