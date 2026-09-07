/**
 * Comando .albion5 — Golem gigante de cerco Albion (5): .albion5
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion5",
    aliases: ["alb5","alb-5"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (5): .albion5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.albion5` para consultar lore e status.";
        return reply(doc);
    }
};
