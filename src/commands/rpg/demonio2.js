/**
 * Comando .demonio2 — Registro de besta do Clã dos Demônios (2): .demonio2
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio2",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (2): .demonio2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.demonio2` para consultar lore e status.";
        return reply(doc);
    }
};
