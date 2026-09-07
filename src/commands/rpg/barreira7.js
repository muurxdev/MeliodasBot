/**
 * Comando .barreira7 — Muralha mágica protetora de Griamore (7): .barreira7
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "barreira7",
    aliases: ["barr7","barr-7"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha mágica protetora de Griamore (7): .barreira7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.barreira7` para consultar lore e status.";
        return reply(doc);
    }
};
