/**
 * Comando .heavymetal7 — Converte a pele em metal de altíssima densidade (7): .heavymetal7
 * Categoria: rpg | Subcategoria: Habilidade Física
 */

module.exports = {
    name: "heavymetal7",
    aliases: ["hmetal7","hmetal-7"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Converte a pele em metal de altíssima densidade (7): .heavymetal7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.heavymetal7` para consultar lore e status.";
        return reply(doc);
    }
};
