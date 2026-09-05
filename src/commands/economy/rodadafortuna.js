/**
 * Comando .rodadafortuna — Roda a Roda da Fortuna com multiplicadores: .rodadafortuna
 */
module.exports = {
    name: "rodadafortuna",
    aliases: [],
    category: "economy",
    subcategory: "Cassino",
    description: "Roda a Roda da Fortuna com multiplicadores: .rodadafortuna",
    cooldownMs: 3000,
    execute: async ({ reply }) => {
            const multis = ["1x", "1.5x", "2x", "3x", "0x", "5x", "10x"];
            const m = multis[Math.floor(Math.random() * multis.length)];
            return reply(`🎡✨ *RODA DA FORTUNA*\n\nA grande roda dourada girou velozmente...\n🎯 *Multiplicador sorteado:* *${m}*!`);
        }
};
