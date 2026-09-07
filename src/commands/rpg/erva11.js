/**
 * Comando .erva11 — Colheita de planta medicinal sagrada (11): .erva11
 * Categoria: rpg | Subcategoria: Botânica Mística
 */

module.exports = {
    name: "erva11",
    aliases: ["herb11","herb-11"],
    category: "rpg",
    subcategory: "Botânica Mística",
    description: "Colheita de planta medicinal sagrada (11): .erva11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.erva11` para consultar lore e status.";
        return reply(doc);
    }
};
