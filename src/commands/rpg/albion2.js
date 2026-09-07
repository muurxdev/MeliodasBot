/**
 * Comando .albion2 — Golem gigante de cerco Albion (2): .albion2
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion2",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (2): .albion2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.albion2` para consultar lore e status.";
        return reply(doc);
    }
};
