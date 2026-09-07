/**
 * Comando .redemoinho3 — Cria redemoinho de areia movediça (3): .redemoinho3
 * Categoria: rpg | Subcategoria: Magia de Terra
 */

module.exports = {
    name: "redemoinho3",
    aliases: ["redem3","redem-3"],
    category: "rpg",
    subcategory: "Magia de Terra",
    description: "Cria redemoinho de areia movediça (3): .redemoinho3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.redemoinho3` para consultar lore e status.";
        return reply(doc);
    }
};
