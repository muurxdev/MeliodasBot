/**
 * Comando .levitacao4 — Domínio dos ventos e telecinese silvestre (4): .levitacao4
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "levitacao4",
    aliases: ["levit4","levit-4"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Domínio dos ventos e telecinese silvestre (4): .levitacao4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.levitacao4` para consultar lore e status.";
        return reply(doc);
    }
};
