/**
 * Comando .torre / .torredosdesafios
 * Torre dos Desafios de 100 Andares com monstros e chefes progressivos
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "torre",
    aliases: ["torredosdesafios", "torre100", "andartorre", "tower"],
    category: "rpg",
    description: "Desafia os 100 andares da lendária Torre dos Desafios de Britânia",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = xpData[sender] || { level: 1, xp: 0, coins: 0 };
        const currentFloor = user.towerFloor || 1;

        const isVictory = Math.random() > 0.3;
        const xpReward = currentFloor * 120 + 300;
        const coinsReward = currentFloor * 200 + 400;

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏰 *TORRE DOS DESAFIOS* 🏰   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🗼 *Andar Atual:* ${currentFloor} / 100\n\n`;

        if (isVictory) {
            user.towerFloor = Math.min(100, currentFloor + 1);
            user.xp = (user.xp || 0) + xpReward;
            user.coins = (user.coins || 0) + coinsReward;
            await dataService.saveXpData(xpData);

            doc += `🏆 *ANDAR ${currentFloor} CONQUISTADO!* 🏆\n\n`;
            doc += `Você derrotou o guardião do andar e desbloqueou o *Andar ${user.towerFloor}*!\n\n`;
            doc += `╭━〔 🎁 RECOMPENSAS DO ANDAR 〕━⬣\n`;
            doc += `┃ ⭐ *XP Ganho:* +${xpReward.toLocaleString("pt-BR")} XP\n`;
            doc += `┃ 💰 *Coins Recebidos:* +${coinsReward.toLocaleString("pt-BR")} coins\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        } else {
            doc += `💀 *DERROTA NO ANDAR ${currentFloor}!* 💀\n\n`;
            doc += `O chefe do andar repeliu seu avanço. Aprimore suas armas em \`.forjar\` e tente novamente!\n\n`;
        }

        doc += `👑 *${botName}*`;
        return reply(doc.trim());
    }
};

