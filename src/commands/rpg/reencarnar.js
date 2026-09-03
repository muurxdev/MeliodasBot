/**
 * Comando .reencarnar / .rebirth
 * Renascimento Supremo: exige Nível 100+, reseta o nível para 1, reseta o mundo para 'floresta'
 * (bloqueando mundos avançados até atingir os níveis correspondentes) e concede +25% DMG/XP perpétuo por Rebirth (máx 10).
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "reencarnar",
    aliases: ["renascer", "rebirth", "reborn", "transcender", "ascensao-divina"],
    category: "rpg",
    description: "Reencarne seu herói: reseta para nível 1 e mundo floresta em troca de +25% bônus permanente acumulativo",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const info = getRebirthInfo(user);

        if (info.isMaxRebirth) {
            return reply(`👑 *LIMITE MÁXIMO DE REBIRTH ALCANÇADO!*\n\nVocê já atingiu o patamar supremo de **${info.maxRebirths} / ${info.maxRebirths} Rebirths** (+${info.bonusDmgPercent}% de Dano e XP perpétuos)!\nNenhum guerreiro mortal ou divindade pode superar sua transcendência.`);
        }

        if (!info.canRebirth) {
            let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            doc += `┃   🌌 *TEMPLO DA REENCARNAÇÃO* 🌌  \n`;
            doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            doc += `⚠️ *REENCARNAÇÃO BLOQUEADA!*\n\n`;
            doc += `╭━━━〔 📜 REQUISITOS SAGRADOS 〕━━━┈⊷\n`;
            doc += `┃ 📈 *Nível Mínimo Exigido:* Nível 100\n`;
            doc += `┃ 👤 *Seu Nível Atual:* Nível ${info.currentLevel}\n`;
            doc += `┃ 🌀 *Rebirths Atuais:* ${info.rebirths} / ${info.maxRebirths}\n`;
            doc += `┃ 🎁 *Bônus Atual:* +${info.bonusDmgPercent}% Dano & XP\n`;
            doc += `┃ 🔜 *Bônus Próximo Rebirth:* +${info.nextBonusDmgPercent}% Dano & XP\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            doc += `💡 _Para reencarnar, você deve atingir o nível máximo (100) através de caçadas (\`.hunt\`), bosses (\`.boss\`) e missões (\`.missao\`)._\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // Processo seguro de Rebirth
        const nextRebirth = info.rebirths + 1;
        user.rebirthCount = nextRebirth;
        user.rebirth_count = nextRebirth;
        user.level = 1;
        user.xp = 0;
        user.mundo = 'floresta'; // Retorna ao primeiro mundo e bloqueia os mundos seguintes
        user.hp = 120;
        user.hpMax = 120;

        await dataService.saveUser(user, { force: true });

        const newStats = calculateFullCharacterStats(user);

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        doc += `┃   🌌 *TRANSCENDÊNCIA REALIZADA!* 🌌  \n`;
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        doc += `✨ *Você transcendeu os limites mortais e renasceu no Reino de Britannia!* ✨\n\n`;
        doc += `╭━━━〔 🌀 STATUS DO REBIRTH (${nextRebirth}/${info.maxRebirths}) 〕━━━┈⊷\n`;
        doc += `┃ 👑 *Grau de Rebirth:* **${nextRebirth}º Renascimento** (Limite: ${info.maxRebirths})\n`;
        doc += `┃ 📈 *Nível Reiniciado:* Nível 1 (XP: 0)\n`;
        doc += `┃ 🌍 *Mundo Atual:* 🌲 **Floresta dos Sonhos** (Mundos avançados bloqueados até reupar)\n`;
        doc += `┃ 💥 *Bônus Permanente:* **+${nextRebirth * 25}% Dano e XP Globais**!\n`;
        doc += `┃ ⚔️ *Ataque Inicial com Bônus:* ${newStats.atk} ATK\n`;
        doc += `┃ 🛡️ *Defesa Inicial com Bônus:* ${newStats.def} DEF\n`;
        doc += `┃ ⚡ *Poder de Combate (CP):* ${newStats.cp} CP\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        doc += `💡 _Seus equipamentos e itens guardados no baú (\`.bau\`) foram preservados intactos!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
