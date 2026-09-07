/**
 * Comando .mandamento4 — Conhecimento e poder do Mandamento (4): .mandamento4
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento4",
    aliases: ["mand4","mand-4"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (4): .mandamento4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.mandamento4` para consultar lore e status.";
        return reply(doc);
    }
};
