/**
 * Comando .pocao5 — Mistura alquímica do Laboratório de Merlin (5): .pocao5
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao5",
    aliases: ["poc5","poc-5"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (5): .pocao5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.pocao5` para consultar lore e status.";
        return reply(doc);
    }
};
