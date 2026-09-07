/**
 * Comando .redemoinho4 — Cria redemoinho de areia movediça (4): .redemoinho4
 * Categoria: rpg | Subcategoria: Magia de Terra
 */

module.exports = {
    name: "redemoinho4",
    aliases: ["redem4","redem-4"],
    category: "rpg",
    subcategory: "Magia de Terra",
    description: "Cria redemoinho de areia movediça (4): .redemoinho4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.redemoinho4` para consultar lore e status.";
        return reply(doc);
    }
};
