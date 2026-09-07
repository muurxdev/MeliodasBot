/**
 * Comando .chastiefol4 — Ativação da Lança Espiritual Chastiefol (4): .chastiefol4
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "chastiefol4",
    aliases: ["chasti4","chasti-4"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Ativação da Lança Espiritual Chastiefol (4): .chastiefol4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌿 *LANÇA ESPIRITUAL CHASTIEFOL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.chastiefol4` para consultar lore e status.";
        return reply(doc);
    }
};
