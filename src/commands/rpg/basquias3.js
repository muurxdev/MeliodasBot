/**
 * Comando .basquias3 — Poder da Lança Espiritual Basquias (3): .basquias3
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "basquias3",
    aliases: ["basq3","basq-3"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Poder da Lança Espiritual Basquias (3): .basquias3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.basquias3` para consultar lore e status.";
        return reply(doc);
    }
};
