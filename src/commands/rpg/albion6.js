/**
 * Comando .albion6 — Golem gigante de cerco Albion (6): .albion6
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion6",
    aliases: ["alb6","alb-6"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (6): .albion6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.albion6` para consultar lore e status.";
        return reply(doc);
    }
};
