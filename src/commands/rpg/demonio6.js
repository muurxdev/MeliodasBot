/**
 * Comando .demonio6 — Registro de besta do Clã dos Demônios (6): .demonio6
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio6",
    aliases: ["demon6","demon-6"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (6): .demonio6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.demonio6` para consultar lore e status.";
        return reply(doc);
    }
};
