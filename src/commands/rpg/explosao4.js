/**
 * Comando .explosao4 — Detonação em cadeia de Guila (4): .explosao4
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "explosao4",
    aliases: ["expl4","expl-4"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Detonação em cadeia de Guila (4): .explosao4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.explosao4` para consultar lore e status.";
        return reply(doc);
    }
};
