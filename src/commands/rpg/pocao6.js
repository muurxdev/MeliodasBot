/**
 * Comando .pocao6 — Mistura alquímica do Laboratório de Merlin (6): .pocao6
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao6",
    aliases: [],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (6): .pocao6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.pocao6` para consultar lore e status.";
        return reply(doc);
    }
};
