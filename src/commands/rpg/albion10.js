/**
 * Comando .albion10 — Golem gigante de cerco Albion (10): .albion10
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion10",
    aliases: ["alb10","alb-10"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (10): .albion10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.albion10` para consultar lore e status.";
        return reply(doc);
    }
};
