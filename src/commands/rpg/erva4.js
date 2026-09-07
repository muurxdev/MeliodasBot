/**
 * Comando .erva4 — Colheita de planta medicinal sagrada (4): .erva4
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva4",
    aliases: [],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (4): .erva4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.erva4` para consultar lore e status.";
        return reply(doc);
    }
};
