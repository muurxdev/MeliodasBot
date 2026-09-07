/**
 * Comando .escuridao2 — Manipulação de matéria escura pura (2): .escuridao2
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "escuridao2",
    aliases: ["escur2","escur-2"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Manipulação de matéria escura pura (2): .escuridao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.escuridao2` para consultar lore e status.";
        return reply(doc);
    }
};
