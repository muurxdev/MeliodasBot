/**
 * Comando .raiodeluz3 — Dispara feixe concentrado de luz solar (3): .raiodeluz3
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "raiodeluz3",
    aliases: ["raioluz3","raioluz-3"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Dispara feixe concentrado de luz solar (3): .raiodeluz3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.raiodeluz3` para consultar lore e status.";
        return reply(doc);
    }
};
