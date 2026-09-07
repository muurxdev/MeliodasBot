/**
 * Comando .reliquia1 — Inspeção de artefato lendário de Britannia (1): .reliquia1
 * Categoria: rpg | Subcategoria: Relíquias Sagradas
 */

module.exports = {
    name: "reliquia1",
    aliases: ["reliq1","reliq-1"],
    category: "rpg",
    subcategory: "Relíquias Sagradas",
    description: "Inspeção de artefato lendário de Britannia (1): .reliquia1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "💎 *RELÍQUIA SAGRADA DE BRITANNIA*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.reliquia1` para consultar lore e status.";
        return reply(doc);
    }
};
