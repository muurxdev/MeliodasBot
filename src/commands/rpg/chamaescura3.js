/**
 * Comando .chamaescura3 — Evoca chamas negras do Purgatório (3): .chamaescura3
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "chamaescura3",
    aliases: ["chama3","chama-3"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Evoca chamas negras do Purgatório (3): .chamaescura3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chamaescura3` para consultar lore e status.";
        return reply(doc);
    }
};
