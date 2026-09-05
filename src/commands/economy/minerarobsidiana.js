/**
 * Comando .minerarobsidiana — Minera blocos de obsidiana vulcânica: .minerarobsidiana
 */
module.exports = {
    name: "minerarobsidiana",
    aliases: [],
    category: "economy",
    subcategory: "Mineração",
    description: "Minera blocos de obsidiana vulcânica: .minerarobsidiana",
    cooldownMs: 3500,
    execute: async ({ reply }) => {
            const achou = Math.random() > 0.5;
            if (achou) {
                return reply(`🌋 *MINERAÇÃO VULCÂNICA*\n\nVocê extraiu com sucesso *1 Bloco de Obsidiana Negra*!\nValor de mercado: 💰 *1.500 moedas*.`);
            }
            return reply(`🌋 A lava espirrou perto e você precisou recuar sem minerar nada.`);
        }
};
