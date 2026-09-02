const { renderCard, formatCoins } = require("../../utils/uiEngine");

module.exports = {
    name: "titulotesouro",
    aliases: ["tesourodireto", "titulosreais", "investirtesouro"],
    category: "economy",
    description: "Investimento em Títulos Públicos do Tesouro Real de Liones",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "TÍTULOS DO TESOURO REAL DE LIONES",
            icon: "📜",
            subtitle: "🏛️ *Renda Fixa Sagrada*",
            sections: [
                {
                    title: "OPÇÕES DE RENDIMENTO",
                    icon: "💰",
                    fields: [
                        { label: "Tesouro Selic Liones", value: "Rende 100% do CDI (Liquidez Diária)", icon: "📈" },
                        { label: "Tesouro IPCA+", value: "Inflação + 6.5% ao ano", icon: "🛡️" },
                        { label: "Aplicação Mínima", value: formatCoins(500), icon: "💳" }
                    ]
                }
            ],
            tip: "Investimento seguro garantido pelo Rei Bartra!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

