/**
 * Comando .chastiefol8 — Ativação da Lança Espiritual Chastiefol (8): .chastiefol8
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "chastiefol8",
    aliases: ["chasti8","chasti-8"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Ativação da Lança Espiritual Chastiefol (8): .chastiefol8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌿 *LANÇA ESPIRITUAL CHASTIEFOL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.chastiefol8` para consultar lore e status.";
        return reply(doc);
    }
};
