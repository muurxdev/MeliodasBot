/**
 * Comando .ark1 — Lança partículas purificadoras de Ark (1): .ark1
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark1",
    aliases: ["holyark1","holyark-1"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (1): .ark1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.ark1` para consultar lore e status.";
        return reply(doc);
    }
};
