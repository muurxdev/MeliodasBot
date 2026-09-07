/**
 * Comando .arcanjo7 — Canalização da bênção dos 4 Arcanjos (7): .arcanjo7
 * Categoria: rpg | Subcategoria: Arcanjos
 */

module.exports = {
    name: "arcanjo7",
    aliases: ["arc7","arc-7"],
    category: "rpg",
    subcategory: "Arcanjos",
    description: "Canalização da bênção dos 4 Arcanjos (7): .arcanjo7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.arcanjo7` para consultar lore e status.";
        return reply(doc);
    }
};
