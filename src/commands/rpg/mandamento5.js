/**
 * Comando .mandamento5 — Conhecimento e poder do Mandamento (5): .mandamento5
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento5",
    aliases: ["mand5","mand-5"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (5): .mandamento5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.mandamento5` para consultar lore e status.";
        return reply(doc);
    }
};
