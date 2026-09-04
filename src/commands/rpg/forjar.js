/**
 * Comando .forjar / .upgrade / .aprimorar / .refinar
 * Sistema de aprimoramento de equipamentos com progressão dinâmica, upgrades múltiplos e exibição de atributos totais reais
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateCharacterStats, getItem } = require("../../services/rpgEquipmentService");
const { getBotName } = require("../../config/botConfig");

function getCostForLevel(targetLevel) {
    // Escala progressiva de custo por nível de forja
    return Math.floor(400 + (targetLevel * 350) + Math.pow(targetLevel, 1.4) * 80);
}

module.exports = {
    name: "forjar",
    aliases: ["upgrade", "aprimorar", "refinar", "upgradearma", "upgradearmadura"],
    category: "rpg",
    description: "Aprimora suas armas e armaduras no ferreiro para aumentar o dano, defesa e poder de combate total",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args, text }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        let currentLvl = Number(user.forgeLevel || 0);

        // Identificação de quantidade de upgrades solicitada
        let countRequested = 1;
        const argNum = args.find(a => /^\d+$/.test(a));
        if (argNum) {
            countRequested = Math.min(25, Math.max(1, parseInt(argNum, 10)));
        } else if (args.some(a => /max|tudo|todos/i.test(a))) {
            // Calcula o máximo que as moedas atuais conseguem pagar (até 25 níveis por vez)
            let tempCoins = user.coins || 0;
            let tempLvl = currentLvl;
            countRequested = 0;
            while (countRequested < 25) {
                const nextCost = getCostForLevel(tempLvl + 1);
                if (tempCoins >= nextCost) {
                    tempCoins -= nextCost;
                    tempLvl++;
                    countRequested++;
                } else {
                    break;
                }
            }
            if (countRequested === 0) {
                const nextCost = getCostForLevel(currentLvl + 1);
                return reply(`🪙 *Saldo Insuficiente para Forjar!*\n\nVocê precisa de *${nextCost.toLocaleString("pt-BR")} Coins* para forjar o nível +${currentLvl + 1}.\n(Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins)`);
            }
        }

        // Simulação e cálculo de custo e sucessos
        let totalCost = 0;
        let sucessos = 0;
        let falhas = 0;
        let simLvl = currentLvl;

        for (let i = 0; i < countRequested; i++) {
            const nextLvl = simLvl + 1;
            const cost = getCostForLevel(nextLvl);

            if ((user.coins || 0) < totalCost + cost) {
                if (i === 0) {
                    return reply(`🪙 *Saldo Insuficiente:* Você precisa de *${cost.toLocaleString("pt-BR")} Coins* para aprimorar para o Nível +${nextLvl}.\n(Seu saldo atual: ${(user.coins || 0).toLocaleString("pt-BR")} Coins)`);
                }
                break; // Para no limite que as moedas conseguiram pagar
            }

            totalCost += cost;

            // Chance de sucesso diminui suavemente conforme o nível sobe
            const successRate = Math.max(40, 95 - (simLvl * 4));
            const roll = Math.floor(Math.random() * 100) + 1;

            if (roll <= successRate) {
                sucessos++;
                simLvl++;
            } else {
                falhas++;
            }
        }

        // Aplica o débito de moedas e a evolução
        user.coins = Math.max(0, (user.coins || 0) - totalCost);
        const previousLvl = currentLvl;
        user.forgeLevel = simLvl;

        dataService.saveXpData(xpData);

        // Recalcula atributos totais reais com a nova forja
        const stats = calculateCharacterStats(user);

        const armaRef = user.slots?.arma || user.arma || user.equipado;
        const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || "Espada de Ferro")) : "Punhos de Ferro";

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║    🔨 *OFICINA DO FERREIRO REAL* 🔨   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;

        if (sucessos > 0) {
            doc += `✨ *${sucessos} APRIMORAMENTO${sucessos > 1 ? "S" : ""} CONCLUÍDO${sucessos > 1 ? "S" : ""} COM SUCESSO!* ✨\n`;
            if (falhas > 0) {
                doc += `⚠️ _(${falhas} tentativa${falhas > 1 ? "s falharam" : " falhou"} durante o martelamento do minério)_\n`;
            }
        } else {
            doc += `💥 *TODAS AS TENTATIVAS DE FORJA FALHARAM!*\n`;
            doc += `_O ferreiro aqueceu demais a bigorna e o metal trincou!_\n`;
        }

        doc += `\n╭━〔 ⚔️ STATUS DO EQUIPAMENTO (+${user.forgeLevel}) 〕━⬣\n`;
        doc += `┃ 🗡️ *Arma Principal:* ${armaNome} +${user.forgeLevel}\n`;
        doc += `┃ 📈 *Nível de Refinamento:* +${previousLvl} ➔ **+${user.forgeLevel}** (+${sucessos} níveis)\n`;
            doc += `┃ 💥 *Ataque Total Real:* **${stats.atk.toLocaleString("pt-BR")} ATK** (+${sucessos * 50} da Forja)\n`;
            doc += `┃ 🛡️ *Defesa Total Real:* **${stats.def.toLocaleString("pt-BR")} DEF** (+${sucessos * 35} da Forja)\n`;
            doc += `┃ ❤️ *Vida Máxima (HP):* **${stats.hpMax.toLocaleString("pt-BR")} HP** (+${sucessos * 120} da Forja)\n`;
            doc += `┃ ⚡ *Poder de Combate (CP):* **${stats.cp.toLocaleString("pt-BR")} CP** (+${sucessos * 250} CP)\n`;
        doc += `┃ 🎯 *Taxa Crítica:* ${stats.crit}% | 💨 *Esquiva:* ${stats.esq}%\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        const proximoCusto = getCostForLevel(user.forgeLevel + 1);
        doc += `╭━〔 💰 ECONOMIA DA FORJA 〕━⬣\n`;
        doc += `┃ 💸 *Total Investido:* -${totalCost.toLocaleString("pt-BR")} Coins\n`;
        doc += `┃ 🪙 *Saldo Restante:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n`;
        doc += `┃ 🔜 *Próximo Nível (+${user.forgeLevel + 1}):* ${proximoCusto.toLocaleString("pt-BR")} Coins\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Dica: Digite \`.forjar 5\` para 5 upgrades de uma vez ou \`.forjar max\` para gastar o saldo máximo disponível!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
