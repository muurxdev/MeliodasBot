/**
 * Comando .tempestade4 — Ciclone perfurante de Howzer (4): .tempestade4
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "tempestade4",
    aliases: [],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Ciclone perfurante de Howzer (4): .tempestade4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.tempestade4` para consultar lore e status.";
        return reply(doc);
    }
};
