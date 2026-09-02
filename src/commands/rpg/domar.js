const { renderCard, formatXP } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
module.exports = {
    name: "domar",
    aliases: ["domarfera", "capturarmonstro", "domaranimal"],
    category: "rpg",
    description: "Tente capturar e domar feras mágicas pelas florestas de Britânia",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        const feras = ["Grifo das Montanhas", "Lobo Demoníaco Vermelho", "Pégaso Celestial", "Falcão Místico"];
        const fera = feras[Math.floor(Math.random() * feras.length)];
        const sucesso = Math.random() > 0.45;

        if (sucesso) {
            user.xp = (user.xp || 0) + 400;
            await dataService.saveXpData(xpData);
            return reply(`🎉 *DOMAÇÃO BEM-SUCEDIDA!*\n\n🐾 Você acalmou e domou o *${fera}*!\n🏆 +400 XP adicionados!`);
        } else {
            return reply(`💨 *A FERA ESCAPOU!* O *${fera}* se assustou e fugiu pela floresta.`);
        }
    }
};