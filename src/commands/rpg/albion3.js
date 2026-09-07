/**
 * Comando .albion3 — Golem gigante de cerco Albion (3): .albion3
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion3",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (3): .albion3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.albion3` para consultar lore e status.";
        return reply(doc);
    }
};
