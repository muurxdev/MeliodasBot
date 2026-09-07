/**
 * Comando .explosao7 — Detonação em cadeia de Guila (7): .explosao7
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "explosao7",
    aliases: ["expl7","expl-7"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Detonação em cadeia de Guila (7): .explosao7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.explosao7` para consultar lore e status.";
        return reply(doc);
    }
};
