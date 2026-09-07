/**
 * Comando .erva1 — Colheita de planta medicinal sagrada (1): .erva1
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva1",
    aliases: ["herb1","herb-1"],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (1): .erva1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.erva1` para consultar lore e status.";
        return reply(doc);
    }
};
