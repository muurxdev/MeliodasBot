/**
 * Comando .tempestade7 — Ciclone perfurante de Howzer (7): .tempestade7
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "tempestade7",
    aliases: [],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Ciclone perfurante de Howzer (7): .tempestade7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.tempestade7` para consultar lore e status.";
        return reply(doc);
    }
};
