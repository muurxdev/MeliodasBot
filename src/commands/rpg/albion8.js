/**
 * Comando .albion8 — Golem gigante de cerco Albion (8): .albion8
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion8",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (8): .albion8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.albion8` para consultar lore e status.";
        return reply(doc);
    }
};
