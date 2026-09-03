/**
 * Comando .jwtdecode
 * Decodificador rápido de cabeçalho e payload de tokens JWT
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "jwtdecode",
    aliases: ["decodificarjwt", "parsejwt", "jwtinfo"],
    category: "dev",
    description: "Decodificador rápido de cabeçalho e payload de tokens JWT",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
    const token = args[0];
    if (!token || !token.includes(".")) {
        return reply("❌ Informe um token JWT de 3 partes separadas por ponto (ex: `.jwtdecode header.payload.signature`).");
    }
    try {
        const parts = token.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
        return reply("🔑 *PAYLOAD JWT DECODIFICADO:*\n\n```json\n" + JSON.stringify(payload, null, 2) + "\n```");
    } catch (e) {
        return reply("❌ Falha ao decodificar payload JWT.");
    }
}
};
