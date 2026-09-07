/**
 * Comando .escuridao9 — Manipulação de matéria escura pura (9): .escuridao9
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "escuridao9",
    aliases: ["escur9","escur-9"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Manipulação de matéria escura pura (9): .escuridao9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.escuridao9` para consultar lore e status.";
        return reply(doc);
    }
};
