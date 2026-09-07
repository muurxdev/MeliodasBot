/**
 * Comando .bencao9 — Bênção de vitalidade e purificação (9): .bencao9
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "bencao9",
    aliases: ["benc9","benc-9"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Bênção de vitalidade e purificação (9): .bencao9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.bencao9` para consultar lore e status.";
        return reply(doc);
    }
};
