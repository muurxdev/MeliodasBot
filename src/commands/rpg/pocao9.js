/**
 * Comando .pocao9 — Mistura alquímica do Laboratório de Merlin (9): .pocao9
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao9",
    aliases: [],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (9): .pocao9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.pocao9` para consultar lore e status.";
        return reply(doc);
    }
};
