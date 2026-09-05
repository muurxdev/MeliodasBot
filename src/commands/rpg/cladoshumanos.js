/**
 * Comando .cladoshumanos — Consulta a linhagem e Cavaleiros Sagrados dos Humanos: .cladoshumanos
 */
module.exports = {
    name: "cladoshumanos",
    aliases: [],
    category: "rpg",
    subcategory: "Lore",
    description: "Consulta a linhagem e Cavaleiros Sagrados dos Humanos: .cladoshumanos",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🛡️ *CLÃ DOS HUMANOS (Britannia)*\n\n▫️ *Reinos:* Reino de Liones, Camelot, Danafor\n▫️ *Elite:* Cavaleiros Sagrados (Grão-Mestres Zaratras, Hendrickson, Dreyfus)\n▫️ *Heróis Lendários:* Ban (o Morto-Vivo), Rei Arthur Pendragon (Rei do Caos)\n▫️ *Potencial Oculto:* Apesar de vidas curtas, carregam a centelha do livre arbítrio e do Caos ancestral.`);
        }
};
