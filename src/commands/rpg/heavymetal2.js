/**
 * Comando .heavymetal2 — Converte a pele em metal de altíssima densidade (2): .heavymetal2
 * Categoria: rpg | Subcategoria: Habilidade Física
 */

module.exports = {
    name: "heavymetal2",
    aliases: ["hmetal2","hmetal-2"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Converte a pele em metal de altíssima densidade (2): .heavymetal2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.heavymetal2` para consultar lore e status.";
        return reply(doc);
    }
};
