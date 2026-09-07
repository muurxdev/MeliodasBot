/**
 * Comando .chamaescura9 — Evoca chamas negras do Purgatório (9): .chamaescura9
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "chamaescura9",
    aliases: ["chama9","chama-9"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Evoca chamas negras do Purgatório (9): .chamaescura9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chamaescura9` para consultar lore e status.";
        return reply(doc);
    }
};
