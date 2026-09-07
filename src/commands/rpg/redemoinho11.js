/**
 * Comando .redemoinho11 — Cria redemoinho de areia movediça (11): .redemoinho11
 * Categoria: rpg | Subcategoria: Magia de Terra
 */

module.exports = {
    name: "redemoinho11",
    aliases: ["redem11","redem-11"],
    category: "rpg",
    subcategory: "Magia de Terra",
    description: "Cria redemoinho de areia movediça (11): .redemoinho11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.redemoinho11` para consultar lore e status.";
        return reply(doc);
    }
};
