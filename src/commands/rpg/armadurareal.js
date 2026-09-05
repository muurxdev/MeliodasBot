/**
 * Comando .armadurareal — Examina uma Armadura Sagrada de Platina de Liones: .armadurareal
 */
module.exports = {
    name: "armadurareal",
    aliases: [],
    category: "rpg",
    subcategory: "Equipamento",
    description: "Examina uma Armadura Sagrada de Platina de Liones: .armadurareal",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🛡️ *ARMADURA SAGRADA DE PLATINA*\n\n▫️ Forjada com aço encantado das minas de Britannia\n▫️ *Resistência Mágica:* +40%\n▫️ *Defesa Física:* +180\n▫️ Usada apenas pelos Cavaleiros Sagrados de Rank Diamante.`);
        }
};
