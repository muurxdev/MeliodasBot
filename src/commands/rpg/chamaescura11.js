/**
 * Comando .chamaescura11 — Evoca chamas negras do Purgatório (11): .chamaescura11
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "chamaescura11",
    aliases: ["chama11","chama-11"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Evoca chamas negras do Purgatório (11): .chamaescura11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chamaescura11` para consultar lore e status.";
        return reply(doc);
    }
};
