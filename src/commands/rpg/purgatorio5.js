/**
 * Comando .purgatorio5 — Sobrevivência nas condições extremas do Purgatório (5): .purgatorio5
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio5",
    aliases: ["purg5","purg-5"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (5): .purgatorio5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.purgatorio5` para consultar lore e status.";
        return reply(doc);
    }
};
