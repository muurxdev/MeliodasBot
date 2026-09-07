/**
 * Comando .arcanjo2 — Canalização da bênção dos 4 Arcanjos (2): .arcanjo2
 * Categoria: rpg | Subcategoria: Arcanjos
 */

module.exports = {
    name: "arcanjo2",
    aliases: ["arc2","arc-2"],
    category: "rpg",
    subcategory: "Arcanjos",
    description: "Canalização da bênção dos 4 Arcanjos (2): .arcanjo2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.arcanjo2` para consultar lore e status.";
        return reply(doc);
    }
};
