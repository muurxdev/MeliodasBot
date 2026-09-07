/**
 * Comando .mandamento2 — Conhecimento e poder do Mandamento (2): .mandamento2
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento2",
    aliases: ["mand2","mand-2"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (2): .mandamento2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.mandamento2` para consultar lore e status.";
        return reply(doc);
    }
};
