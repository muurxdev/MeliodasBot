const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "mineracaonuvem",
    aliases: ["mineradoranuvem", "cloudmining", "minerarbitcoin"],
    category: "economy",
    description: "Consulta e contratação de poder de computação de mineração em nuvem",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "MINERAÇÃO EM NUVEM DE BRITÂNIA",
            icon: "⛏️",
            subtitle: `⚡ *Hashrate Ativo:* 45 TH/s`,
            sections: [
                {
                    title: "ESTATÍSTICAS DAS MINERADORAS",
                    icon: "💻",
                    fields: [
                        { label: "Cripto Minerada", value: "Britânia Coin (BTC)", icon: "🪙" },
                        { label: "Rendimento Estimado", value: "+850 Coins / dia", icon: "💰" },
                        { label: "Status da Fazenda", value: "🟢 *100% OPERACIONAL*", icon: "✨" }
                    ]
                }
            ],
            tip: "Use .cripto para negociar suas moedas no mercado!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};