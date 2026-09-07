/**
 * Comando .tempestade3 — Ciclone perfurante de Howzer (3): .tempestade3
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "tempestade3",
    aliases: ["temp3","temp-3"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Ciclone perfurante de Howzer (3): .tempestade3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.tempestade3` para consultar lore e status.";
        return reply(doc);
    }
};
