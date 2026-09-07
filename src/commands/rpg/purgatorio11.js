/**
 * Comando .purgatorio11 — Sobrevivência nas condições extremas do Purgatório (11): .purgatorio11
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio11",
    aliases: [],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (11): .purgatorio11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purgatorio11` para consultar lore e status.";
        return reply(doc);
    }
};
