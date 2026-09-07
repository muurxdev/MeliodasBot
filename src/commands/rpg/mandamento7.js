/**
 * Comando .mandamento7 — Conhecimento e poder do Mandamento (7): .mandamento7
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento7",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (7): .mandamento7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.mandamento7` para consultar lore e status.";
        return reply(doc);
    }
};
