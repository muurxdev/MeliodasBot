/**
 * Comando .purga6 — Expurgo de energia sombria (6): .purga6
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "purga6",
    aliases: ["purge6","purge-6"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Expurgo de energia sombria (6): .purga6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purga6` para consultar lore e status.";
        return reply(doc);
    }
};
