/**
 * Comando .purga3 — Expurgo de energia sombria (3): .purga3
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "purga3",
    aliases: ["purge3","purge-3"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Expurgo de energia sombria (3): .purga3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.purga3` para consultar lore e status.";
        return reply(doc);
    }
};
