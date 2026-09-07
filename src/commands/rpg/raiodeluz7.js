/**
 * Comando .raiodeluz7 — Dispara feixe concentrado de luz solar (7): .raiodeluz7
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "raiodeluz7",
    aliases: ["raioluz7","raioluz-7"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Dispara feixe concentrado de luz solar (7): .raiodeluz7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.raiodeluz7` para consultar lore e status.";
        return reply(doc);
    }
};
