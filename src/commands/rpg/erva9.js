/**
 * Comando .erva9 — Colheita de planta medicinal sagrada (9): .erva9
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva9",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (9): .erva9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.erva9` para consultar lore e status.";
        return reply(doc);
    }
};
