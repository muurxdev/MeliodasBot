/**
 * Comando .demonio9 — Registro de besta do Clã dos Demônios (9): .demonio9
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio9",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (9): .demonio9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.demonio9` para consultar lore e status.";
        return reply(doc);
    }
};
