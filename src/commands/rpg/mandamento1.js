/**
 * Comando .mandamento1 — Conhecimento e poder do Mandamento (1): .mandamento1
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento1",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (1): .mandamento1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.mandamento1` para consultar lore e status.";
        return reply(doc);
    }
};
