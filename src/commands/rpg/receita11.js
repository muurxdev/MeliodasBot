/**
 * Comando .receita11 — Prato especial da Taverna Chapéu de Javali (11): .receita11
 * Categoria: rpg | Subcategoria: Cozinha de Britannia
 */

module.exports = {
    name: "receita11",
    aliases: ["rec11","rec-11"],
    category: "rpg",
    subcategory: "Cozinha de Britannia",
    description: "Prato especial da Taverna Chapéu de Javali (11): .receita11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.receita11` para consultar lore e status.";
        return reply(doc);
    }
};
