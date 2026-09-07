/**
 * Comando .demonio8 — Registro de besta do Clã dos Demônios (8): .demonio8
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "demonio8",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Registro de besta do Clã dos Demônios (8): .demonio8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.demonio8` para consultar lore e status.";
        return reply(doc);
    }
};
