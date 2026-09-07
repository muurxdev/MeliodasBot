/**
 * Comando .chastiefol9 — Ativação da Lança Espiritual Chastiefol (9): .chastiefol9
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "chastiefol9",
    aliases: ["chasti9","chasti-9"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Ativação da Lança Espiritual Chastiefol (9): .chastiefol9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌿 *LANÇA ESPIRITUAL CHASTIEFOL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chastiefol9` para consultar lore e status.";
        return reply(doc);
    }
};
