/**
 * Comando .heavymetal10 — Converte a pele em metal de altíssima densidade (10): .heavymetal10
 * Categoria: rpg | Subcategoria: Habilidade Física
 */

module.exports = {
    name: "heavymetal10",
    aliases: ["hmetal10","hmetal-10"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Converte a pele em metal de altíssima densidade (10): .heavymetal10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.heavymetal10` para consultar lore e status.";
        return reply(doc);
    }
};
