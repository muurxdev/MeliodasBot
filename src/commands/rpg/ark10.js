/**
 * Comando .ark10 — Lança partículas purificadoras de Ark (10): .ark10
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark10",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (10): .ark10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.ark10` para consultar lore e status.";
        return reply(doc);
    }
};
