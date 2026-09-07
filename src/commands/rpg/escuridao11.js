/**
 * Comando .escuridao11 — Manipulação de matéria escura pura (11): .escuridao11
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "escuridao11",
    aliases: ["escur11","escur-11"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Manipulação de matéria escura pura (11): .escuridao11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.escuridao11` para consultar lore e status.";
        return reply(doc);
    }
};
