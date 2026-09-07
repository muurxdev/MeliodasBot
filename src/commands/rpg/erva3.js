/**
 * Comando .erva3 — Colheita de planta medicinal sagrada (3): .erva3
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva3",
    aliases: ["herb3","herb-3"],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (3): .erva3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.erva3` para consultar lore e status.";
        return reply(doc);
    }
};
