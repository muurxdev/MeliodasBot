/**
 * Comando .tempestaderaios — Dispara a magia Thunderbolt de Gilthunder: .tempestaderaios
 */
module.exports = {
    name: "tempestaderaios",
    aliases: [],
    category: "rpg",
    subcategory: "Magia",
    description: "Dispara a magia Thunderbolt de Gilthunder: .tempestaderaios",
    cooldownMs: 2500,
    execute: async ({ reply }) => {
            const dano = Math.floor(Math.random() * 600) + 300;
            return reply(`⚡ *THUNDERBOLT (Trovão Imperial)*\n\nUm raio rasga os céus de Liones direto na direção do solo!\n⚡ *Dano de Choque:* *${dano} Volts* elétricos\nOponente paralisado por 1 rodada.`);
        }
};
