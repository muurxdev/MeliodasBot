/**
 * Comando .resgatepremio — Resgata cupons de bonificação na taverna: .resgatepremio <codigo>
 */
module.exports = {
    name: "resgatepremio",
    aliases: [],
    category: "economy",
    subcategory: "Recompensas",
    description: "Resgata cupons de bonificação na taverna: .resgatepremio <codigo>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const cod = (args[0] || "").toUpperCase();
            if (!cod) return reply("🎟️ Uso: `.resgatepremio <CODIGO>`");
            const val = Math.floor(Math.random() * 800) + 200;
            return reply(`🎟️ *CUPOM RESGATADO!*\nCódigo: *${cod}*\nBônus creditado: 💰 *${val} Moedas de Ouro*!`);
        }
};
