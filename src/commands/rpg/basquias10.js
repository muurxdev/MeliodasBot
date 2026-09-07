/**
 * Comando .basquias10 — Poder da Lança Espiritual Basquias (10): .basquias10
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "basquias10",
    aliases: [],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Poder da Lança Espiritual Basquias (10): .basquias10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.basquias10` para consultar lore e status.";
        return reply(doc);
    }
};
