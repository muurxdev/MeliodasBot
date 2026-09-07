/**
 * Comando .purgatorio7 — Sobrevivência nas condições extremas do Purgatório (7): .purgatorio7
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio7",
    aliases: ["purg7","purg-7"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (7): .purgatorio7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purgatorio7` para consultar lore e status.";
        return reply(doc);
    }
};
