/**
 * Comando .raiodeluz9 — Dispara feixe concentrado de luz solar (9): .raiodeluz9
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "raiodeluz9",
    aliases: ["raioluz9","raioluz-9"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Dispara feixe concentrado de luz solar (9): .raiodeluz9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.raiodeluz9` para consultar lore e status.";
        return reply(doc);
    }
};
