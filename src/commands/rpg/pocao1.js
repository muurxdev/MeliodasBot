/**
 * Comando .pocao1 — Mistura alquímica do Laboratório de Merlin (1): .pocao1
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao1",
    aliases: ["poc1","poc-1"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (1): .pocao1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.pocao1` para consultar lore e status.";
        return reply(doc);
    }
};
