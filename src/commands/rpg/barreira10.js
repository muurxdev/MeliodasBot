/**
 * Comando .barreira10 — Muralha mágica protetora de Griamore (10): .barreira10
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "barreira10",
    aliases: ["barr10","barr-10"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha mágica protetora de Griamore (10): .barreira10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.barreira10` para consultar lore e status.";
        return reply(doc);
    }
};
