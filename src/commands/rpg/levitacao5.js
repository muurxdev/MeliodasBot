/**
 * Comando .levitacao5 — Domínio dos ventos e telecinese silvestre (5): .levitacao5
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "levitacao5",
    aliases: ["levit5","levit-5"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Domínio dos ventos e telecinese silvestre (5): .levitacao5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.levitacao5` para consultar lore e status.";
        return reply(doc);
    }
};
