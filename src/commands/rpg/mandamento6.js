/**
 * Comando .mandamento6 — Conhecimento e poder do Mandamento (6): .mandamento6
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento6",
    aliases: [],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (6): .mandamento6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.mandamento6` para consultar lore e status.";
        return reply(doc);
    }
};
