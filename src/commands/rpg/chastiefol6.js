/**
 * Comando .chastiefol6 — Ativação da Lança Espiritual Chastiefol (6): .chastiefol6
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "chastiefol6",
    aliases: ["chasti6","chasti-6"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Ativação da Lança Espiritual Chastiefol (6): .chastiefol6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌿 *LANÇA ESPIRITUAL CHASTIEFOL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.chastiefol6` para consultar lore e status.";
        return reply(doc);
    }
};
