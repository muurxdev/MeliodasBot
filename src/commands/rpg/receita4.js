/**
 * Comando .receita4 — Prato especial da Taverna Chapéu de Javali (4): .receita4
 * Categoria: rpg | Subcategoria: Cozinha de Britannia
 */

module.exports = {
    name: "receita4",
    aliases: ["rec4","rec-4"],
    category: "rpg",
    subcategory: "Cozinha de Britannia",
    description: "Prato especial da Taverna Chapéu de Javali (4): .receita4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.receita4` para consultar lore e status.";
        return reply(doc);
    }
};
