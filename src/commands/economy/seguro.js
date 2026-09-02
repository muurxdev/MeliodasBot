const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "seguro",
    aliases: ["segurocarteira", "apoliceseguro", "protegercarteira"],
    category: "economy",
    description: "Contrate um seguro para proteger suas moedas contra roubos",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "SEGURO PATRIMONIAL DE BRITÂNIA",
            icon: "🛡️",
            subtitle: `📜 *Apólice:* Seguro Total de Moedas`,
            sections: [
                {
                    title: "COBERTURA DA APÓLICE",
                    icon: "🔒",
                    fields: [
                        { label: "Proteção Roubos", value: "Reembolso de até 80%", icon: "🛡️" },
                        { label: "Mensalidade", value: formatCoins(1000) + " / semana", icon: "💳" }
                    ]
                }
            ],
            tip: "Guarde suas moedas no .cofre para 100% de proteção gratuita!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};