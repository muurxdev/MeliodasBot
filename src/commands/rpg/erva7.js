/**
 * Comando .erva7 — Colheita de planta medicinal sagrada (7): .erva7
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva7",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (7): .erva7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.erva7` para consultar lore e status.";
        return reply(doc);
    }
};
