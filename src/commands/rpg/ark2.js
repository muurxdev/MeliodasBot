/**
 * Comando .ark2 — Lança partículas purificadoras de Ark (2): .ark2
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark2",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (2): .ark2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.ark2` para consultar lore e status.";
        return reply(doc);
    }
};
