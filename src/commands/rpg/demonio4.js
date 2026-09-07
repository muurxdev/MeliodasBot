/**
 * Comando .demonio4 — Registro de besta do Clã dos Demônios (4): .demonio4
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio4",
    aliases: ["demon4","demon-4"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (4): .demonio4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.demonio4` para consultar lore e status.";
        return reply(doc);
    }
};
