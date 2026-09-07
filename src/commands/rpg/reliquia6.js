/**
 * Comando .reliquia6 — Inspeção de artefato lendário de Britannia (6): .reliquia6
 * Categoria: rpg | Subcategoria: Relíquias Sagradas
 */

module.exports = {
    name: "reliquia6",
    aliases: ["reliq6","reliq-6"],
    category: "rpg",
    subcategory: "Relíquias Sagradas",
    description: "Inspeção de artefato lendário de Britannia (6): .reliquia6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💎 *RELÍQUIA SAGRADA DE BRITANNIA*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.reliquia6` para consultar lore e status.";
        return reply(doc);
    }
};
