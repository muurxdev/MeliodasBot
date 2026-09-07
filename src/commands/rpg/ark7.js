/**
 * Comando .ark7 — Lança partículas purificadoras de Ark (7): .ark7
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark7",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (7): .ark7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.ark7` para consultar lore e status.";
        return reply(doc);
    }
};
