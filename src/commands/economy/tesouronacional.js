/**
 * Comando .tesouronacional — Consulta o cofre da reserva soberana de Britannia: .tesouronacional
 */
module.exports = {
    name: "tesouronacional",
    aliases: [],
    category: "economy",
    subcategory: "Status",
    description: "Consulta o cofre da reserva soberana de Britannia: .tesouronacional",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`👑 *RESERVA SOBERANA DE BRITANNIA*\n\n▫️ Ouro em custódia: 14.850.000 Moedas de Ouro\n▫️ Barras de Mithril: 4.200 barras\n▫️ Gemas Elementares: 1.890 pedras\n▫️ Protegido pelos Cavaleiros Sagrados de Liones.`);
        }
};
