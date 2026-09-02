/**
 * MeliodasBot — Comando .anunciooficial
 * Envia um comunicado oficial formatado e destacado para o grupo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "anunciooficial",
    aliases: ["comunicado", "avisoadmin", "notificacaogrupo"],
    category: "admin",
    description: "Envia um comunicado oficial formatado e destacado para o grupo",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
    const msg = args.join(" ").trim() || "Atenção a todos os membros para as novas diretrizes do grupo.";
    const card = renderCard({
        title: "COMUNICADO OFICIAL DA ADMINISTRAÇÃO",
        icon: "📢",
        subtitle: "🛡️ *Emitido por:* @" + sender.split("@")[0],
        sections: [
            {
                title: "MENSAGEM IMPORTANTE",
                icon: "📌",
                fields: [msg]
            }
        ],
        tip: "Todos os membros devem ler e respeitar as regras!",
        mentions: [sender]
    });
    return reply(card, [sender]);
}
};
