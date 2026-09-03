/**
 * Comando .antidelete
 * Auditoria de histórico de mensagens e mídias apagadas no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "antidelete",
    aliases: ["verapagadas", "msgdeletadas", "auditapagar"],
    category: "admin",
    description: "Auditoria de histórico de mensagens e mídias apagadas no grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "AUDITORIA ANTI-DELETE DE MENSAGENS",
        icon: "🗑️",
        subtitle: "🛡️ *Registro de Moderação*",
        sections: [
            {
                title: "STATUS DO MONITORAMENTO",
                icon: "👁️",
                fields: [
                    { label: "Módulo Anti-Delete", value: "🟢 *ATIVO*", icon: "⚙️" },
                    { label: "Mensagens Rastreadas", value: "Últimas 100 Mensagens", icon: "📊" },
                    { label: "Mídias Temporárias", value: "Salvas para Auditoria", icon: "🖼️" }
                ]
            }
        ],
        tip: "Administradores podem auditar mensagens apagadas por infratores!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
