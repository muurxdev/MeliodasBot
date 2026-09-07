/**
 * Comando .albion1 — Golem gigante de cerco Albion (1): .albion1
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion1",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (1): .albion1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.albion1` para consultar lore e status.";
        return reply(doc);
    }
};
