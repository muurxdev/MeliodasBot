const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "loteriaacumulada",
    aliases: ["megapremios", "acumuladaloto", "premioacumulado"],
    category: "economy",
    description: "Consulte o prêmio acumulado da Mega Loteria de Britânia",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "MEGA LOTERIA ACUMULADA",
            icon: "🎰",
            subtitle: `👑 *Prêmio Estimado:* ${formatCoins(1000000)}`,
            sections: [
                {
                    title: "DETALHES DO CONCURSO",
                    icon: "🎟️",
                    fields: [
                        { label: "Próximo Sorteio", value: "Domingo às 20h00", icon: "⏱️" },
                        { label: "Preço do Bilhete", value: formatCoins(500), icon: "💳" },
                        { label: "Como Apostar", value: ".megasena 6 números (ex: .megasena 04 12 28 35 44 59)", icon: "🎯" }
                    ]
                }
            ],
            tip: "Compre seu bilhete e concorra a 1 Milhão de Coins!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};