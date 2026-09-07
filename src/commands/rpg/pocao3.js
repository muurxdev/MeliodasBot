/**
 * Comando .pocao3 — Mistura alquímica do Laboratório de Merlin (3): .pocao3
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao3",
    aliases: ["poc3","poc-3"],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (3): .pocao3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.pocao3` para consultar lore e status.";
        return reply(doc);
    }
};
