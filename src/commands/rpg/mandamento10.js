/**
 * Comando .mandamento10 — Conhecimento e poder do Mandamento (10): .mandamento10
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento10",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (10): .mandamento10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.mandamento10` para consultar lore e status.";
        return reply(doc);
    }
};
