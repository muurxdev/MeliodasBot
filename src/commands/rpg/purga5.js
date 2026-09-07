/**
 * Comando .purga5 — Expurgo de energia sombria (5): .purga5
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "purga5",
    aliases: ["purge5","purge-5"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Expurgo de energia sombria (5): .purga5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.purga5` para consultar lore e status.";
        return reply(doc);
    }
};
