/**
 * Comando .arcanjo5 — Canalização da bênção dos 4 Arcanjos (5): .arcanjo5
 * Categoria: rpg | Subcategoria: Arcanjos
 */

module.exports = {
    name: "arcanjo5",
    aliases: ["arc5","arc-5"],
    category: "rpg",
    subcategory: "Arcanjos",
    description: "Canalização da bênção dos 4 Arcanjos (5): .arcanjo5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.arcanjo5` para consultar lore e status.";
        return reply(doc);
    }
};
