/**
 * Comando .polen2 — Dispersa pólen curativo da Árvore Sagrada (2): .polen2
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen2",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (2): .polen2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.polen2` para consultar lore e status.";
        return reply(doc);
    }
};
