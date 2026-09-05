/**
 * Comando .casteloliones — Visita o Castelo Real de Liones: .casteloliones
 */
module.exports = {
    name: "casteloliones",
    aliases: [],
    category: "rpg",
    subcategory: "Local",
    description: "Visita o Castelo Real de Liones: .casteloliones",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🏰 *CASTELO REAL DE LIONES*\n\n▫️ Assento do Rei Bartra Liones (Vision)\n▫️ Centro de comando dos Cavaleiros Sagrados e quartel dos Sete Pecados Capitais.`);
        }
};
