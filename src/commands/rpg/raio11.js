/**
 * Comando .raio11 — Invocação de relâmpagos de Gilthunder (11): .raio11
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "raio11",
    aliases: ["trovao11","trovao-11"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Invocação de relâmpagos de Gilthunder (11): .raio11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *TROVÃO DE LIONES*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.raio11` para consultar lore e status.";
        return reply(doc);
    }
};
