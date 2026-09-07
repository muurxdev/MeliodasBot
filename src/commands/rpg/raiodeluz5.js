/**
 * Comando .raiodeluz5 — Dispara feixe concentrado de luz solar (5): .raiodeluz5
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "raiodeluz5",
    aliases: ["raioluz5","raioluz-5"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Dispara feixe concentrado de luz solar (5): .raiodeluz5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.raiodeluz5` para consultar lore e status.";
        return reply(doc);
    }
};
