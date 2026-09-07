/**
 * Comando .erva8 — Colheita de planta medicinal sagrada (8): .erva8
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva8",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (8): .erva8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.erva8` para consultar lore e status.";
        return reply(doc);
    }
};
