/**
 * Comando .purgatorio1 — Sobrevivência nas condições extremas do Purgatório (1): .purgatorio1
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio1",
    aliases: ["purg1","purg-1"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (1): .purgatorio1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purgatorio1` para consultar lore e status.";
        return reply(doc);
    }
};
