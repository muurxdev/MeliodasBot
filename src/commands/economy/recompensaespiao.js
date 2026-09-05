/**
 * Comando .recompensaespiao — Recebe pagamento por informações prestadas à coroa: .recompensaespiao
 */
module.exports = {
    name: "recompensaespiao",
    aliases: [],
    category: "economy",
    subcategory: "Missão",
    description: "Recebe pagamento por informações prestadas à coroa: .recompensaespiao",
    cooldownMs: 3500,
    execute: async ({ reply }) => {
            const pgto = Math.floor(Math.random() * 900) + 300;
            return reply(`📜🕵️ *RECOMPENSA DE INTELIGÊNCIA*\n\nO capitão dos Cavaleiros Sagrados confirmou seus relatórios sobre a movimentação inimiga!\n💰 Pagamento efetuado: *+${pgto} Moedas de Ouro*.`);
        }
};
