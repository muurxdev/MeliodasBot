/**
 * Comando .albion4 — Golem gigante de cerco Albion (4): .albion4
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion4",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (4): .albion4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.albion4` para consultar lore e status.";
        return reply(doc);
    }
};
