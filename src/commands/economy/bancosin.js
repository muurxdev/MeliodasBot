/**
 * Comando .bancosin — Acessa a conta corrente do Banco Central dos Sete Pecados: .bancosin
 */
module.exports = {
    name: "bancosin",
    aliases: [],
    category: "economy",
    subcategory: "Banco",
    description: "Acessa a conta corrente do Banco Central dos Sete Pecados: .bancosin",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏦 *BANCO CENTRAL DOS SETE PECADOS*\n\n▫️ Cliente de Rank Ouro\n▫️ Poupança: Rendimento de 0.8% a cada ciclo ativo\n▫️ Saque disponível a qualquer momento sem taxas em todas as tavernas credenciadas.`);
        }
};
