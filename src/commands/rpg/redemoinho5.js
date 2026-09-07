/**
 * Comando .redemoinho5 — Cria redemoinho de areia movediça (5): .redemoinho5
 * Categoria: rpg | Subcategoria: Magia de Terra
 */

module.exports = {
    name: "redemoinho5",
    aliases: ["redem5","redem-5"],
    category: "rpg",
    subcategory: "Magia de Terra",
    description: "Cria redemoinho de areia movediça (5): .redemoinho5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.redemoinho5` para consultar lore e status.";
        return reply(doc);
    }
};
