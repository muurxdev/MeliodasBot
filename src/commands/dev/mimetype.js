/**
 * Comando .mimetype
 * Dicionário de tipos MIME por extensão de arquivo
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "mimetype",
    aliases: ["tipomime", "contenttype", "mimetypes"],
    category: "dev",
    description: "Dicionário de tipos MIME por extensão de arquivo",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
    const ext = (args[0] || "json").replace(".", "").toLowerCase();
    const types = {
        json: "application/json", png: "image/png", jpg: "image/jpeg",
        webp: "image/webp", mp4: "video/mp4", mp3: "audio/mpeg", pdf: "application/pdf"
    };
    const mime = types[ext] || "application/octet-stream";
    return reply("📑 *MIME TYPE:*\n\n📁 Extensão: `." + ext + "`\n📡 Content-Type: `" + mime + "`");
}
};
