/**
 * MeliodasBot — Comando .bolsafam
 * Resgate de auxílio emergencial para jogadores com saldo zerado na carteira e banco
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

module.exports = {
    name: "bolsafam",
    aliases: ["auxilio", "bolsafamilia", "esmola", "socorro", "ajudaemergencial"],
    category: "economy",
    description: "Resgate um auxílio emergencial caso tenha ficado completamente falido",
    cooldownMs: 60000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const totalWealth = (user.coins || 0) + (user.bank || 0);

        if (totalWealth > 100) {
            return reply(`🚫 *Auxílio Negado:* Você ainda possui **${totalWealth.toLocaleString("pt-BR")} Coins** em patrimônio total. O auxílio emergencial é reservado apenas para cidadãos falidos com menos de 100 moedas.`);
        }

        const grant = 250;
        user.coins = (user.coins || 0) + grant;
        dataService.saveUser(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🍞 *AUXÍLIO EMERGENCIAL* 🍞   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👑 *O Reino de Liones concedeu uma ajuda financeira aos necessitados!*\n\n`;
        doc += `💰 *Benefício Recebido:* +${grant} Coins!\n`;
        doc += `🪙 *Novo Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n\n`;
        doc += `💡 _Trabalhe duro com \`.trabalhar\`, \`.pescar\` e \`.minerar\` para reconstruir sua fortuna!_`;

        return reply(doc.trim());
    }
};

