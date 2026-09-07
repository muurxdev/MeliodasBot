/**
 * Comando .arcanjo1 — Canalização da bênção dos 4 Arcanjos (1): .arcanjo1
 * Categoria: rpg | Subcategoria: Arcanjos
 */

module.exports = {
    name: "arcanjo1",
    aliases: ["arc1","arc-1"],
    category: "rpg",
    subcategory: "Arcanjos",
    description: "Canalização da bênção dos 4 Arcanjos (1): .arcanjo1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.arcanjo1` para consultar lore e status.";
        return reply(doc);
    }
};
