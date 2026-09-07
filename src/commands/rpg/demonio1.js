/**
 * Comando .demonio1 — Registro de besta do Clã dos Demônios (1): .demonio1
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio1",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (1): .demonio1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.demonio1` para consultar lore e status.";
        return reply(doc);
    }
};
