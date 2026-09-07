/**
 * Comando .raio5 — Invocação de relâmpagos de Gilthunder (5): .raio5
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "raio5",
    aliases: ["trovao5","trovao-5"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Invocação de relâmpagos de Gilthunder (5): .raio5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *TROVÃO DE LIONES*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.raio5` para consultar lore e status.";
        return reply(doc);
    }
};
