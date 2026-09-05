/**
 * Comando .seguronanatsu — Contrata apólice de seguro contra ataques de monstros: .seguronanatsu
 */
module.exports = {
    name: "seguronanatsu",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Contrata apólice de seguro contra ataques de monstros: .seguronanatsu",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🛡️ *SEGURO DE VIDA & ESPÓLIO DE BRITANNIA*\n\n▫️ Cobertura: Reembolso de 80% do ouro perdido se cair em batalha contra demônios.\n▫️ Custo Mensal: 💰 150 Moedas\n▫️ Corretora: Merlin Corretora de Riscos Mágicos.`);
        }
};
