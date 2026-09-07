/**
 * Comando .erva2 — Colheita de planta medicinal sagrada (2): .erva2
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva2",
    aliases: ["herb2","herb-2"],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (2): .erva2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.erva2` para consultar lore e status.";
        return reply(doc);
    }
};
