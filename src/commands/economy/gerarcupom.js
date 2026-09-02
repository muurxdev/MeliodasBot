const { renderCard, formatCoins } = require("../../utils/uiEngine");
module.exports = {
    name: "gerarcupom",
    aliases: ["criarcupom", "novocupom", "cupompromo"],
    category: "economy",
    description: "Gera um cupom de resgate exclusivo de moedas",
    cooldownMs: 4000,
    execute: async ({ reply, args }) => {
        const valor = parseInt(args[0], 10) || 2000;
        const cod = "MEL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        return reply("🎟️ *CUPOM PROMOCIONAL GERADO!*\n\n🔑 *Código:* `" + cod + "`\n💰 *Valor:* " + formatCoins(valor) + "\n💡 Use `.resgatarpremio " + cod + "` para resgatar!");
    }
};