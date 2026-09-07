/**
 * Comando .receita8 — Prato especial da Taverna Chapéu de Javali (8): .receita8
 * Categoria: rpg | Subcategoria: Cozinha de Britannia
 */

module.exports = {
    name: "receita8",
    aliases: ["rec8","rec-8"],
    category: "rpg",
    subcategory: "Cozinha de Britannia",
    description: "Prato especial da Taverna Chapéu de Javali (8): .receita8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.receita8` para consultar lore e status.";
        return reply(doc);
    }
};
