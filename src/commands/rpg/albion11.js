/**
 * Comando .albion11 — Golem gigante de cerco Albion (11): .albion11
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion11",
    aliases: ["alb11","alb-11"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (11): .albion11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.albion11` para consultar lore e status.";
        return reply(doc);
    }
};
