/**
 * Comando .demonio5 — Registro de besta do Clã dos Demônios (5): .demonio5
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio5",
    aliases: ["demon5","demon-5"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (5): .demonio5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.demonio5` para consultar lore e status.";
        return reply(doc);
    }
};
