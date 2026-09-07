/**
 * Comando .demonio10 — Registro de besta do Clã dos Demônios (10): .demonio10
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio10",
    aliases: ["demon10","demon-10"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (10): .demonio10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.demonio10` para consultar lore e status.";
        return reply(doc);
    }
};
