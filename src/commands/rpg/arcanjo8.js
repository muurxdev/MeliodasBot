/**
 * Comando .arcanjo8 — Canalização da bênção dos 4 Arcanjos (8): .arcanjo8
 * Categoria: rpg | Subcategoria: Arcanjos
 */

module.exports = {
    name: "arcanjo8",
    aliases: ["arc8","arc-8"],
    category: "rpg",
    subcategory: "Arcanjos",
    description: "Canalização da bênção dos 4 Arcanjos (8): .arcanjo8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.arcanjo8` para consultar lore e status.";
        return reply(doc);
    }
};
