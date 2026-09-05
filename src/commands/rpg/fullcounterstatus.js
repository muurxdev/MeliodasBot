/**
 * Comando .fullcounterstatus — Verifica a prontidão do Full Counter: .fullcounterstatus
 */
module.exports = {
    name: "fullcounterstatus",
    aliases: [],
    category: "rpg",
    subcategory: "Combate",
    description: "Verifica a prontidão do Full Counter: .fullcounterstatus",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🗡️ *FULL COUNTER (Reação Total)*\n\n▫️ *Meliodas:* Reflete qualquer magia de volta com mais que o dobro do impacto!\n▫️ *Estarossa:* Full Counter físico — reflete impactos e golpes brutos!\n▫️ *Requisito:* Tempo de reação perfeito e timing exato do projétil.`);
        }
};
