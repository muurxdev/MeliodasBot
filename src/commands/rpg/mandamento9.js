/**
 * Comando .mandamento9 — Conhecimento e poder do Mandamento (9): .mandamento9
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento9",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (9): .mandamento9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.mandamento9` para consultar lore e status.";
        return reply(doc);
    }
};
