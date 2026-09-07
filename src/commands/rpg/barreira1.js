/**
 * Comando .barreira1 — Muralha mágica protetora de Griamore (1): .barreira1
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "barreira1",
    aliases: ["barr1","barr-1"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha mágica protetora de Griamore (1): .barreira1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.barreira1` para consultar lore e status.";
        return reply(doc);
    }
};
