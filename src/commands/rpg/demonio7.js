/**
 * Comando .demonio7 — Registro de besta do Clã dos Demônios (7): .demonio7
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio7",
    aliases: ["demon7","demon-7"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (7): .demonio7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.demonio7` para consultar lore e status.";
        return reply(doc);
    }
};
