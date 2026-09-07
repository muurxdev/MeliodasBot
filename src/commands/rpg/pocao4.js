/**
 * Comando .pocao4 — Mistura alquímica do Laboratório de Merlin (4): .pocao4
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao4",
    aliases: [],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (4): .pocao4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.pocao4` para consultar lore e status.";
        return reply(doc);
    }
};
