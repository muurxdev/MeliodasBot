/**
 * Comando .albion7 — Golem gigante de cerco Albion (7): .albion7
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion7",
    aliases: ["alb7","alb-7"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (7): .albion7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.albion7` para consultar lore e status.";
        return reply(doc);
    }
};
