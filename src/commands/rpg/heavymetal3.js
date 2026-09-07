/**
 * Comando .heavymetal3 — Converte a pele em metal de altíssima densidade (3): .heavymetal3
 * Categoria: rpg | Subcategoria: Habilidade Física
 */

module.exports = {
    name: "heavymetal3",
    aliases: ["hmetal3","hmetal-3"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Converte a pele em metal de altíssima densidade (3): .heavymetal3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.heavymetal3` para consultar lore e status.";
        return reply(doc);
    }
};
