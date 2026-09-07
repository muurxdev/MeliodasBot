/**
 * Comando .pocao8 — Mistura alquímica do Laboratório de Merlin (8): .pocao8
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao8",
    aliases: ["poc8","poc-8"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (8): .pocao8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.pocao8` para consultar lore e status.";
        return reply(doc);
    }
};
