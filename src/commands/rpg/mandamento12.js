/**
 * Comando .mandamento12 — Conhecimento e poder do Mandamento (12): .mandamento12
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento12",
    aliases: ["mand12","mand-12"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (12): .mandamento12",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 12\n▫️ *Poder de Combate (CP):* +1800 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.mandamento12` para consultar lore e status.";
        return reply(doc);
    }
};
