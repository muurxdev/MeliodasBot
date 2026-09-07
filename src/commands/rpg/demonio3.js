/**
 * Comando .demonio3 — Registro de besta do Clã dos Demônios (3): .demonio3
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio3",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (3): .demonio3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.demonio3` para consultar lore e status.";
        return reply(doc);
    }
};
