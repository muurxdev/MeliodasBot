/**
 * Comando .purgatorio6 — Sobrevivência nas condições extremas do Purgatório (6): .purgatorio6
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio6",
    aliases: ["purg6","purg-6"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (6): .purgatorio6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purgatorio6` para consultar lore e status.";
        return reply(doc);
    }
};
