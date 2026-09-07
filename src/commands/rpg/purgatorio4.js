/**
 * Comando .purgatorio4 — Sobrevivência nas condições extremas do Purgatório (4): .purgatorio4
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio4",
    aliases: ["purg4","purg-4"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (4): .purgatorio4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purgatorio4` para consultar lore e status.";
        return reply(doc);
    }
};
