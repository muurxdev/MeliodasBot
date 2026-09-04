/**
 * Comando .curar / .curar-max / .heal
 * Restaura 100% da vida máxima total calculada com armaduras, classes e níveis
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { calculateFullCharacterStats } = require('../../services/characterEngine');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'curar',
    aliases: ['heal', 'recuperar', 'curarmax', 'fullheal', 'curatotal'],
    category: 'rpg',
    description: 'Restaura a vida total do jogador (HP Máximo com armaduras) com poções ou taxa de moedas',
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const realMaxHp = stats.hpMax;
        const currentHp = Number(user.hp || realMaxHp);

        if (currentHp >= realMaxHp) {
            return reply(`❤️ *SEU HP JÁ ESTÁ NO MÁXIMO!*\n\n💖 Vida: **${currentHp.toLocaleString('pt-BR')} / ${realMaxHp.toLocaleString('pt-BR')} HP** (100%)\n🛡️ Suas armaduras e bênçãos estão protegendo seu corpo.`);
        }

        const missingHp = realMaxHp - currentHp;
        const custo = Math.max(10, Math.floor(missingHp * 0.15));

        if ((user.coins || 0) < custo) {
            return reply(`❌ *Coins Insuficientes para Cura Completa!*\n\n❤️ HP Atual: ${currentHp.toLocaleString('pt-BR')} / ${realMaxHp.toLocaleString('pt-BR')}\n💰 Necessário: **${custo.toLocaleString('pt-BR')} Coins**\n💵 Seu Saldo: ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n💡 Ganhe moedas trabalhando (\`.trabalhar\`) ou caçando (\`.hunt\`).`);
        }

        user.coins -= custo;
        user.hp = realMaxHp;
        user.hpMax = realMaxHp;
        user.hp_max = realMaxHp;

        await dataService.saveXpData(xpData);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   💖 *CURA TOTAL REALIZADA!* 💖   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Sua energia vital foi 100% restaurada pela magia sagrada!* ✨\n\n`;
        doc += `╭━〔 ❤️ STATUS VITAL 〕━⬣\n`;
        doc += `┃ 💖 *HP Restaurado:* **${realMaxHp.toLocaleString('pt-BR')} / ${realMaxHp.toLocaleString('pt-BR')} HP** (100%)\n`;
        doc += `┃ 🩹 *Vida Recuperada:* +${missingHp.toLocaleString('pt-BR')} HP\n`;
        doc += `┃ 💸 *Custo da Cura:* -${custo.toLocaleString('pt-BR')} Coins\n`;
        doc += `┃ 🪙 *Saldo Restante:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};