/**
 * Comando .mandamento8 — Conhecimento e poder do Mandamento (8): .mandamento8
 * Categoria: rpg | Subcategoria: Mandamentos
 */

module.exports = {
    name: "mandamento8",
    aliases: ["mand8","mand-8"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Conhecimento e poder do Mandamento (8): .mandamento8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.mandamento8` para consultar lore e status.";
        return reply(doc);
    }
};
