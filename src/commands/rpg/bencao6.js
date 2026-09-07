/**
 * Comando .bencao6 — Bênção de vitalidade e purificação (6): .bencao6
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "bencao6",
    aliases: ["benc6","benc-6"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Bênção de vitalidade e purificação (6): .bencao6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.bencao6` para consultar lore e status.";
        return reply(doc);
    }
};
