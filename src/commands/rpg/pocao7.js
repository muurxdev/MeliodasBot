/**
 * Comando .pocao7 — Mistura alquímica do Laboratório de Merlin (7): .pocao7
 * Categoria: rpg | Subcategoria: Alquimia
 */

module.exports = {
    name: "pocao7",
    aliases: [],
    category: "rpg",
    subcategory: "Alquimia",
    description: "Mistura alquímica do Laboratório de Merlin (7): .pocao7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🧪 *ELIXIR ALQUÍMICO DE MERLIN*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.pocao7` para consultar lore e status.";
        return reply(doc);
    }
};
