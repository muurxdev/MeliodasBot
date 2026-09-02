const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "dadoaposta",
    aliases: ["apostar-dado", "jogardadoaposta", "dadopoupar"],
    category: "economy",
    description: "Aposte em Par ou Ímpar no lançamento de dados (2x)",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const escolha = (args[0] || "").toLowerCase();
        const aposta = parseInt(args[1], 10) || 200;
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if (!["par", "impar", "ímpar"].includes(escolha)) {
            return reply("❌ Escolha entre `par` ou `impar` e o valor da aposta (ex: `.dadoaposta par 500`).");
        }

        if ((user.coins || 0) < aposta) {
            return reply(`❌ *Saldo insuficiente!* Você possui ${formatCoins(user.coins || 0)}.`);
        }

        user.coins -= aposta;
        const dado1 = Math.floor(Math.random() * 6) + 1;
        const dado2 = Math.floor(Math.random() * 6) + 1;
        const soma = dado1 + dado2;
        const deuPar = soma % 2 === 0;
        const acertou = (escolha === "par" && deuPar) || (escolha.startsWith("imp") && !deuPar);

        let premio = 0;
        if (acertou) {
            premio = aposta * 2;
            user.coins += premio;
        }
        await dataService.saveXpData(xpData);

        return reply(`🎲 *DADOS LANÇADOS: [ ${dado1} ] + [ ${dado2} ] = ${soma} (${deuPar ? "PAR" : "ÍMPAR"})*\n\n${acertou ? `🎉 *VOCÊ GANHOU!* +\n${formatCoins(premio)}` : "❌ *VOCÊ PERDEU A APOSTA!*"}`);
    }
};