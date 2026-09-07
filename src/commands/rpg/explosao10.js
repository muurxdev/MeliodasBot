/**
 * Comando .explosao10 — Detonação em cadeia de Guila (10): .explosao10
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "explosao10",
    aliases: ["expl10","expl-10"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Detonação em cadeia de Guila (10): .explosao10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.explosao10` para consultar lore e status.";
        return reply(doc);
    }
};
