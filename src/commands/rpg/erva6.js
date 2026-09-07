/**
 * Comando .erva6 — Colheita de planta medicinal sagrada (6): .erva6
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva6",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (6): .erva6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.erva6` para consultar lore e status.";
        return reply(doc);
    }
};
