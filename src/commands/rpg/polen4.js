/**
 * Comando .polen4 — Dispersa pólen curativo da Árvore Sagrada (4): .polen4
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen4",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (4): .polen4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.polen4` para consultar lore e status.";
        return reply(doc);
    }
};
