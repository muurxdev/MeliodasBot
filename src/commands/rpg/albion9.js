/**
 * Comando .albion9 — Golem gigante de cerco Albion (9): .albion9
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "albion9",
    aliases: ["alb9","alb-9"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Golem gigante de cerco Albion (9): .albion9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.albion9` para consultar lore e status.";
        return reply(doc);
    }
};
