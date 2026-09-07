/**
 * Comando .bencao2 — Bênção de vitalidade e purificação (2): .bencao2
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "bencao2",
    aliases: ["benc2","benc-2"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Bênção de vitalidade e purificação (2): .bencao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.bencao2` para consultar lore e status.";
        return reply(doc);
    }
};
