/**
 * Comando .purga8 — Expurgo de energia sombria (8): .purga8
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "purga8",
    aliases: ["purge8","purge-8"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Expurgo de energia sombria (8): .purga8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.purga8` para consultar lore e status.";
        return reply(doc);
    }
};
