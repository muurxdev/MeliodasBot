/**
 * Comando .levitacao11 — Domínio dos ventos e telecinese silvestre (11): .levitacao11
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "levitacao11",
    aliases: ["levit11","levit-11"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Domínio dos ventos e telecinese silvestre (11): .levitacao11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.levitacao11` para consultar lore e status.";
        return reply(doc);
    }
};
