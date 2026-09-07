/**
 * Comando .escuridao7 — Manipulação de matéria escura pura (7): .escuridao7
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "escuridao7",
    aliases: ["escur7","escur-7"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Manipulação de matéria escura pura (7): .escuridao7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.escuridao7` para consultar lore e status.";
        return reply(doc);
    }
};
