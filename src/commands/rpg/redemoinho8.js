/**
 * Comando .redemoinho8 — Cria redemoinho de areia movediça (8): .redemoinho8
 * Categoria: rpg | Subcategoria: Magia de Terra
 */

module.exports = {
    name: "redemoinho8",
    aliases: ["redem8","redem-8"],
    category: "rpg",
    subcategory: "Magia de Terra",
    description: "Cria redemoinho de areia movediça (8): .redemoinho8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.redemoinho8` para consultar lore e status.";
        return reply(doc);
    }
};
