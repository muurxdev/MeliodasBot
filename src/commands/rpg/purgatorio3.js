/**
 * Comando .purgatorio3 — Sobrevivência nas condições extremas do Purgatório (3): .purgatorio3
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio3",
    aliases: [],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (3): .purgatorio3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purgatorio3` para consultar lore e status.";
        return reply(doc);
    }
};
