/**
 * Comando .mandamento3 — Conhecimento e poder do Mandamento (3): .mandamento3
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento3",
    aliases: ["mand3","mand-3"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (3): .mandamento3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.mandamento3` para consultar lore e status.";
        return reply(doc);
    }
};
