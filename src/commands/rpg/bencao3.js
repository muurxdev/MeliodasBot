/**
 * Comando .bencao3 — Bênção de vitalidade e purificação (3): .bencao3
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "bencao3",
    aliases: ["benc3","benc-3"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Bênção de vitalidade e purificação (3): .bencao3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.bencao3` para consultar lore e status.";
        return reply(doc);
    }
};
