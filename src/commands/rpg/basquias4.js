/**
 * Comando .basquias4 — Poder da Lança Espiritual Basquias (4): .basquias4
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "basquias4",
    aliases: ["basq4","basq-4"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Poder da Lança Espiritual Basquias (4): .basquias4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.basquias4` para consultar lore e status.";
        return reply(doc);
    }
};
