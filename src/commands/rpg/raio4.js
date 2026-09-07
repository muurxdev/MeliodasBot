/**
 * Comando .raio4 — Invocação de relâmpagos de Gilthunder (4): .raio4
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "raio4",
    aliases: ["trovao4","trovao-4"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Invocação de relâmpagos de Gilthunder (4): .raio4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *TROVÃO DE LIONES*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.raio4` para consultar lore e status.";
        return reply(doc);
    }
};
