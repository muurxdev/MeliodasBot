/**
 * Comando .doacaoreino — Faz uma doação para os orfanatos de Britannia: .doacaoreino <valor>
 */
module.exports = {
    name: "doacaoreino",
    aliases: [],
    category: "economy",
    subcategory: "Social",
    description: "Faz uma doação para os orfanatos de Britannia: .doacaoreino <valor>",
    cooldownMs: 2500,
    execute: async ({ reply, args }) => {
            const val = parseInt(args[0]) || 100;
            return reply(`🕊️ *ATO DE CARIDADE REAL*\n\nVocê doou 💰 *${val} moedas* para as crianças carentes de Liones.\n✨ Sua reputação no reino subiu e as bênçãos celestiais recaem sobre você!`);
        }
};
