/**
 * Comando .receita6 — Prato especial da Taverna Chapéu de Javali (6): .receita6
 * Categoria: rpg | Subcategoria: Cozinha de Britannia
 */

module.exports = {
    name: "receita6",
    aliases: ["rec6","rec-6"],
    category: "rpg",
    subcategory: "Cozinha de Britannia",
    description: "Prato especial da Taverna Chapéu de Javali (6): .receita6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.receita6` para consultar lore e status.";
        return reply(doc);
    }
};
