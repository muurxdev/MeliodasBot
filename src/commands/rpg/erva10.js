/**
 * Comando .erva10 — Colheita de planta medicinal sagrada (10): .erva10
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva10",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (10): .erva10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.erva10` para consultar lore e status.";
        return reply(doc);
    }
};
