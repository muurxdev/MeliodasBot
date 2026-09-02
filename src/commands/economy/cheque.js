const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "cheque",
    aliases: ["emitircheque", "talaocheque", "chequepagamento"],
    category: "economy",
    description: "Emita cheques nominais com código de compensação",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const valor = parseInt(args[0], 10) || 1000;
        const card = renderCard({
            title: "CHEQUE NOMINAL DO BANCO DE LIONES",
            icon: "🧾",
            subtitle: `🏛️ *Emitente:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "DADOS DO CHEQUE",
                    icon: "💰",
                    fields: [
                        { label: "Valor", value: formatCoins(valor), icon: "🪙" },
                        { label: "Código de Compensação", value: `CHK-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, icon: "🔢" },
                        { label: "Validade", value: "30 Dias", icon: "⏱️" }
                    ]
                }
            ],
            tip: "Use .pay @user <valor> para transferências instantâneas!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};