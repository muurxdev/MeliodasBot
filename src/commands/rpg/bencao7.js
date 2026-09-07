/**
 * Comando .bencao7 — Bênção de vitalidade e purificação (7): .bencao7
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "bencao7",
    aliases: ["benc7","benc-7"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Bênção de vitalidade e purificação (7): .bencao7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.bencao7` para consultar lore e status.";
        return reply(doc);
    }
};
