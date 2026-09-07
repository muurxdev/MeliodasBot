/**
 * Comando .purga10 — Expurgo de energia sombria (10): .purga10
 * Categoria: rpg | Subcategoria: Magia Demoníaca
 */

module.exports = {
    name: "purga10",
    aliases: ["purge10","purge-10"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Expurgo de energia sombria (10): .purga10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.purga10` para consultar lore e status.";
        return reply(doc);
    }
};
