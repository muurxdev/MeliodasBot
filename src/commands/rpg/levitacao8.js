/**
 * Comando .levitacao8 — Domínio dos ventos e telecinese silvestre (8): .levitacao8
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "levitacao8",
    aliases: ["levit8","levit-8"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Domínio dos ventos e telecinese silvestre (8): .levitacao8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.levitacao8` para consultar lore e status.";
        return reply(doc);
    }
};
