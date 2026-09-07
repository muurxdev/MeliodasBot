/**
 * Comando .tempestade9 — Ciclone perfurante de Howzer (9): .tempestade9
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "tempestade9",
    aliases: ["temp9","temp-9"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Ciclone perfurante de Howzer (9): .tempestade9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.tempestade9` para consultar lore e status.";
        return reply(doc);
    }
};
