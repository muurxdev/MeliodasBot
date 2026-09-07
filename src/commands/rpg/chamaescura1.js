/**
 * Comando .chamaescura1 — Evoca chamas negras do Purgatório (1): .chamaescura1
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "chamaescura1",
    aliases: ["chama1","chama-1"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Evoca chamas negras do Purgatório (1): .chamaescura1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chamaescura1` para consultar lore e status.";
        return reply(doc);
    }
};
