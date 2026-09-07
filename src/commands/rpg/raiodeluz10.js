/**
 * Comando .raiodeluz10 — Dispara feixe concentrado de luz solar (10): .raiodeluz10
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "raiodeluz10",
    aliases: ["raioluz10","raioluz-10"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Dispara feixe concentrado de luz solar (10): .raiodeluz10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.raiodeluz10` para consultar lore e status.";
        return reply(doc);
    }
};
