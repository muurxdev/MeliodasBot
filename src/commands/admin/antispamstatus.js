/**
 * MeliodasBot — Comando .antispamstatus
 * Relatório de proteção contra rajadas e flood de mensagens
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "antispamstatus",
    aliases: ["statusantispam", "floodstatus", "detectorflood"],
    category: "admin",
    description: "Relatório de proteção contra rajadas e flood de mensagens",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "STATUS DO MÓDULO ANTI-SPAM & FLOOD",
        icon: "🛡️",
        subtitle: "⚡ *Proteção Ativa 24/7*",
        sections: [
            {
                title: "PARÂMETROS DE SEGURANÇA",
                icon: "🔒",
                fields: [
                    { label: "Limite de Rajada", value: "5 msgs / 3 segundos", icon: "⏱️" },
                    { label: "Suspensão Automática", value: "15 Segundos (Nível 1)", icon: "⏳" },
                    { label: "Status Geral", value: "🟢 *OPERACIONAL*", icon: "✨" }
                ]
            }
        ],
        tip: "O Anti-Spam protege o grupo contra bots travadores!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
