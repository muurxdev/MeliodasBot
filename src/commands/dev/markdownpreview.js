/**
 * MeliodasBot — Comando .markdownpreview
 * Guia de formatação Markdown para mensagens de WhatsApp
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "markdownpreview",
    aliases: ["testarmarkdown", "mdformat", "whatsappmarkdown"],
    category: "dev",
    description: "Guia de formatação Markdown para mensagens de WhatsApp",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
    return reply("📝 *GUIA DE FORMATAÇÃO DO WHATSAPP:*\n\n• *Negrito:* `*texto*` ➔ *texto*\n• _Itálico:_ `_texto_` ➔ _texto_\n• ~Tachado:~ `~texto~` ➔ ~texto~\n• Monoespaçado: ```texto```\n• > Citação: `> texto`");
}
};
