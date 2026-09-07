/**
 * Comando .polen11 — Dispersa pólen curativo da Árvore Sagrada (11): .polen11
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen11",
    aliases: ["pollen11","pollen-11"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (11): .polen11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.polen11` para consultar lore e status.";
        return reply(doc);
    }
};
