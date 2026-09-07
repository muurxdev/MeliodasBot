/**
 * Comando .reliquia10 — Inspeção de artefato lendário de Britannia (10): .reliquia10
 * Categoria: rpg | Subcategoria: Relíquias Sagradas
 */

module.exports = {
    name: "reliquia10",
    aliases: [],
    category: "rpg",
    subcategory: "Relíquias Sagradas",
    description: "Inspeção de artefato lendário de Britannia (10): .reliquia10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💎 *RELÍQUIA SAGRADA DE BRITANNIA*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.reliquia10` para consultar lore e status.";
        return reply(doc);
    }
};
