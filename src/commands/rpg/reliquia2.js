/**
 * Comando .reliquia2 — Inspeção de artefato lendário de Britannia (2): .reliquia2
 * Categoria: rpg | Subcategoria: Relíquias Sagradas
 */

module.exports = {
    name: "reliquia2",
    aliases: ["reliq2","reliq-2"],
    category: "rpg",
    subcategory: "Relíquias Sagradas",
    description: "Inspeção de artefato lendário de Britannia (2): .reliquia2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💎 *RELÍQUIA SAGRADA DE BRITANNIA*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.reliquia2` para consultar lore e status.";
        return reply(doc);
    }
};
