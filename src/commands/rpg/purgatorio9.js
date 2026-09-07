/**
 * Comando .purgatorio9 — Sobrevivência nas condições extremas do Purgatório (9): .purgatorio9
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio9",
    aliases: [],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (9): .purgatorio9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purgatorio9` para consultar lore e status.";
        return reply(doc);
    }
};
