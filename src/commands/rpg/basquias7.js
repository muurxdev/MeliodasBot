/**
 * Comando .basquias7 — Poder da Lança Espiritual Basquias (7): .basquias7
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "basquias7",
    aliases: ["basq7","basq-7"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Poder da Lança Espiritual Basquias (7): .basquias7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.basquias7` para consultar lore e status.";
        return reply(doc);
    }
};
