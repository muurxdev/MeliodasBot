/**
 * Comando .demonio11 — Registro de besta do Clã dos Demônios (11): .demonio11
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio11",
    aliases: ["demon11","demon-11"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (11): .demonio11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.demonio11` para consultar lore e status.";
        return reply(doc);
    }
};
