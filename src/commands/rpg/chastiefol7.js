/**
 * Comando .chastiefol7 — Ativação da Lança Espiritual Chastiefol (7): .chastiefol7
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "chastiefol7",
    aliases: ["chasti7","chasti-7"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Ativação da Lança Espiritual Chastiefol (7): .chastiefol7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌿 *LANÇA ESPIRITUAL CHASTIEFOL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.chastiefol7` para consultar lore e status.";
        return reply(doc);
    }
};
