/**
 * Comando .amaldicoado — Verifica a maldição eterna de reencarnação e imortalidade: .amaldicoado
 */
module.exports = {
    name: "amaldicoado",
    aliases: [],
    category: "rpg",
    subcategory: "Status",
    description: "Verifica a maldição eterna de reencarnação e imortalidade: .amaldicoado",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`💔 *AS MALDIÇÕES DOS DEUSES SUPREMOS*\n\n▫️ *Meliodas:* Vida Eterna imposta pelo Rei Demônio (nunca morre, mas perde as emoções a cada renascimento no Purgatório).\n▫️ *Elizabeth:* Reencarnação Perpétua imposta pela Suprema Divindade (vive como humana e morre inevitavelmente 3 dias após lembrar de suas vidas passadas).`);
        }
};
