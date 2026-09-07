/**
 * Comando .purgatorio10 — Sobrevivência nas condições extremas do Purgatório (10): .purgatorio10
 * Categoria: rpg | Subcategoria: Purgatório
 */

module.exports = {
    name: "purgatorio10",
    aliases: ["purg10","purg-10"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Sobrevivência nas condições extremas do Purgatório (10): .purgatorio10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.purgatorio10` para consultar lore e status.";
        return reply(doc);
    }
};
