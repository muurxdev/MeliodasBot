/**
 * Comando .curaramigo — Usa magia curativa de Elizabeth em alguém: .curaramigo [nome]
 */
module.exports = {
    name: "curaramigo",
    aliases: [],
    category: "general",
    subcategory: "Cura",
    description: "Usa magia curativa de Elizabeth em alguém: .curaramigo [nome]",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const alvo = args.join(" ") || "ferido";
            return reply(`💖✨ *TOQUE CURATIVO DE ELIZABETH*\n\nAs feridas e arranhões de *${alvo}* desapareceram sob uma suave luz prateada! +1000 HP restaurados!`);
        }
};
