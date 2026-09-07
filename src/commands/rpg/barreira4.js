/**
 * Comando .barreira4 — Muralha mágica protetora de Griamore (4): .barreira4
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "barreira4",
    aliases: ["barr4","barr-4"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha mágica protetora de Griamore (4): .barreira4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.barreira4` para consultar lore e status.";
        return reply(doc);
    }
};
