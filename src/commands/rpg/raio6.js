/**
 * Comando .raio6 — Invocação de relâmpagos de Gilthunder (6): .raio6
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "raio6",
    aliases: ["trovao6","trovao-6"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Invocação de relâmpagos de Gilthunder (6): .raio6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *TROVÃO DE LIONES*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.raio6` para consultar lore e status.";
        return reply(doc);
    }
};
