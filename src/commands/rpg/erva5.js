/**
 * Comando .erva5 — Colheita de planta medicinal sagrada (5): .erva5
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva5",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (5): .erva5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.erva5` para consultar lore e status.";
        return reply(doc);
    }
};
