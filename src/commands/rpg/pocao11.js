/**
 * Comando .pocao11 — Mistura alquímica do Laboratório de Merlin (11): .pocao11
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao11",
    aliases: [],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (11): .pocao11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.pocao11` para consultar lore e status.";
        return reply(doc);
    }
};
