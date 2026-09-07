/**
 * Comando .raio7 — Invocação de relâmpagos de Gilthunder (7): .raio7
 * Categoria: rpg | Subcategoria: Cavaleiros Sagrados
 */

module.exports = {
    name: "raio7",
    aliases: ["trovao7","trovao-7"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Invocação de relâmpagos de Gilthunder (7): .raio7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚡ *TROVÃO DE LIONES*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.raio7` para consultar lore e status.";
        return reply(doc);
    }
};
