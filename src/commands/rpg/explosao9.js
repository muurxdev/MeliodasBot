/**
 * Comando .explosao9 — Detonação em cadeia de Guila (9): .explosao9
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "explosao9",
    aliases: ["expl9","expl-9"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Detonação em cadeia de Guila (9): .explosao9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.explosao9` para consultar lore e status.";
        return reply(doc);
    }
};
