/**
 * Comando .purgatorio8 — Sobrevivência nas condições extremas do Purgatório (8): .purgatorio8
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio8",
    aliases: ["purg8","purg-8"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (8): .purgatorio8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purgatorio8` para consultar lore e status.";
        return reply(doc);
    }
};
