/**
 * Comando .barreira2 — Muralha mágica protetora de Griamore (2): .barreira2
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "barreira2",
    aliases: ["barr2","barr-2"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha mágica protetora de Griamore (2): .barreira2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.barreira2` para consultar lore e status.";
        return reply(doc);
    }
};
