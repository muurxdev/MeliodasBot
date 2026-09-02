/**
 * MeliodasBot — Comando .adivinheonumero
 * Tente acertar o número secreto entre 1 e 100
 */

const { renderCard, formatCoins, formatXP, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "adivinheonumero",
    aliases: ["acerten\u00famero", "guessnumber", "adivinharnumero"],
    category: "fun",
    description: "Tente acertar o número secreto entre 1 e 100",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
    const palpite = parseInt(args[0], 10);
    if (isNaN(palpite) || palpite < 1 || palpite > 100) {
        return reply("❌ Envie um palpite de 1 a 100 (ex: `.adivinheonumero 42`).");
    }
    const secreto = 57;
    if (palpite === secreto) {
        return reply("🎉 *ACERTOU O NÚMERO EXATO (" + secreto + ")!* 🏆 Parabéns! +1.000 Coins!");
    } else if (palpite < secreto) {
        return reply("📈 *O número secreto é MAIOR que " + palpite + "!* Tente um valor mais alto.");
    } else {
        return reply("📉 *O número secreto é MENOR que " + palpite + "!* Tente um valor mais baixo.");
    }
}
};
