/**
 * Comando .escuridao5 — Manipulação de matéria escura pura (5): .escuridao5
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "escuridao5",
    aliases: ["escur5","escur-5"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Manipulação de matéria escura pura (5): .escuridao5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.escuridao5` para consultar lore e status.";
        return reply(doc);
    }
};
