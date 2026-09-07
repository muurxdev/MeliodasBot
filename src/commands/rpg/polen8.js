/**
 * Comando .polen8 — Dispersa pólen curativo da Árvore Sagrada (8): .polen8
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen8",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (8): .polen8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.polen8` para consultar lore e status.";
        return reply(doc);
    }
};
