/**
 * Comando .pocao10 — Mistura alquímica do Laboratório de Merlin (10): .pocao10
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao10",
    aliases: ["poc10","poc-10"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (10): .pocao10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.pocao10` para consultar lore e status.";
        return reply(doc);
    }
};
