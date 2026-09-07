/**
 * Comando .basquias11 — Poder da Lança Espiritual Basquias (11): .basquias11
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "basquias11",
    aliases: ["basq11","basq-11"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Poder da Lança Espiritual Basquias (11): .basquias11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.basquias11` para consultar lore e status.";
        return reply(doc);
    }
};
