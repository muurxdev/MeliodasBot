/**
 * Comando .chamaescura5 — Evoca chamas negras do Purgatório (5): .chamaescura5
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "chamaescura5",
    aliases: ["chama5","chama-5"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Evoca chamas negras do Purgatório (5): .chamaescura5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.chamaescura5` para consultar lore e status.";
        return reply(doc);
    }
};
