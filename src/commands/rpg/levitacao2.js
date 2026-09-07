/**
 * Comando .levitacao2 — Domínio dos ventos e telecinese silvestre (2): .levitacao2
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "levitacao2",
    aliases: ["levit2","levit-2"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Domínio dos ventos e telecinese silvestre (2): .levitacao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.levitacao2` para consultar lore e status.";
        return reply(doc);
    }
};
