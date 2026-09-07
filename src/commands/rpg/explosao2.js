/**
 * Comando .explosao2 — Detonação em cadeia de Guila (2): .explosao2
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "explosao2",
    aliases: ["expl2","expl-2"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Detonação em cadeia de Guila (2): .explosao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.explosao2` para consultar lore e status.";
        return reply(doc);
    }
};
