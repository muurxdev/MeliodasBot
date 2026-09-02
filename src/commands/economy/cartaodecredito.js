const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "cartaodecredito",
    aliases: ["cartaocredito", "meucartao", "faturacartao"],
    category: "economy",
    description: "Consulta o limite e fatura do seu cartão de crédito do Reino",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "CARTÃO BLACK DE LIONES",
            icon: "💳",
            subtitle: `👤 *Titular:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "DADOS DA FATURA",
                    icon: "📊",
                    fields: [
                        { label: "Limite Disponível", value: formatCoins(50000), icon: "💎" },
                        { label: "Fatura Atual", value: formatCoins(0), icon: "🧾" },
                        { label: "Status", value: "🟢 *ATIVO (Sem Dívidas)*", icon: "✨" }
                    ]
                }
            ],
            tip: "Mantenha seus pagamentos em dia para aumentar seu limite!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};