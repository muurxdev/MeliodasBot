/**
 * Comando .mandamento11 — Conhecimento e poder do Mandamento (11): .mandamento11
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento11",
    aliases: ["mand11","mand-11"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (11): .mandamento11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.mandamento11` para consultar lore e status.";
        return reply(doc);
    }
};
