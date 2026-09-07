/**
 * Comando .receita1 — Prato especial da Taverna Chapéu de Javali (1): .receita1
 * Categoria: rpg | Subcategoria: Cozinha de Britannia
 */

module.exports = {
    name: "receita1",
    aliases: ["rec1","rec-1"],
    category: "rpg",
    subcategory: "Cozinha de Britannia",
    description: "Prato especial da Taverna Chapéu de Javali (1): .receita1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.receita1` para consultar lore e status.";
        return reply(doc);
    }
};
