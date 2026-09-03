/**
 * Comando .listapalavrasproibidas
 * Consulta a lista de termos e palavras bloqueadas no grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "listapalavrasproibidas",
    aliases: ["verblacklist", "palavrasbloqueadas", "filtropalavras"],
    category: "admin",
    description: "Consulta a lista de termos e palavras bloqueadas no grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
    const card = renderCard({
        title: "LISTA NEGRA DE PALAVRAS PROIBIDAS",
        icon: "🚫",
        subtitle: "🛡️ *Filtro Ativo*",
        sections: [
            {
                title: "TERMOS BLOQUEADOS",
                icon: "📜",
                fields: [
                    "• Links maliciosos / Phishing",
                    "• Ofensas graves e discurso de ódio",
                    "• Divulgação não autorizada"
                ]
            }
        ],
        tip: "Use .blacklistword <palavra> para adicionar novos filtros!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
