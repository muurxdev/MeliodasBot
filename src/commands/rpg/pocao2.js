/**
 * Comando .pocao2 — Mistura alquímica do Laboratório de Merlin (2): .pocao2
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao2",
    aliases: ["poc2","poc-2"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (2): .pocao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.pocao2` para consultar lore e status.";
        return reply(doc);
    }
};
