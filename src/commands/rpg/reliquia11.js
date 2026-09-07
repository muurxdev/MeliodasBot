/**
 * Comando .reliquia11 — Inspeção de artefato lendário de Britannia (11): .reliquia11
 * Categoria: rpg | Subcategoria: Relíquias Sagradas
 */

module.exports = {
    name: "reliquia11",
    aliases: [],
    category: "rpg",
    subcategory: "Relíquias Sagradas",
    description: "Inspeção de artefato lendário de Britannia (11): .reliquia11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💎 *RELÍQUIA SAGRADA DE BRITANNIA*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.reliquia11` para consultar lore e status.";
        return reply(doc);
    }
};
