/**
 * Comando .purgatorio2 — Sobrevivência nas condições extremas do Purgatório (2): .purgatorio2
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio2",
    aliases: ["purg2","purg-2"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (2): .purgatorio2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purgatorio2` para consultar lore e status.";
        return reply(doc);
    }
};
