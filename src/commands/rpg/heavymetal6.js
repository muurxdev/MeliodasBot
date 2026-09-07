/**
 * Comando .heavymetal6 — Converte a pele em metal de altíssima densidade (6): .heavymetal6
 * Categoria: rpg | Subcategoria: Habilidade Física
 */

module.exports = {
    name: "heavymetal6",
    aliases: ["hmetal6","hmetal-6"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Converte a pele em metal de altíssima densidade (6): .heavymetal6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.heavymetal6` para consultar lore e status.";
        return reply(doc);
    }
};
