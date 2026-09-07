/**
 * Comando .tempestade11 — Ciclone perfurante de Howzer (11): .tempestade11
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "tempestade11",
    aliases: ["temp11","temp-11"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Ciclone perfurante de Howzer (11): .tempestade11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.tempestade11` para consultar lore e status.";
        return reply(doc);
    }
};
