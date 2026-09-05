/**
 * Comando .torre — Torre dos Desafios, INFINITA.
 *
 * Antes: teto rígido de 100 andares (`Math.min(100, ...)`), 70% de vitória fixa
 * em qualquer andar e recompensa linear — o andar 99 valia quase o mesmo que o 5
 * e, ao chegar em 100, a progressão simplesmente parava.
 *
 * Agora:
 *  - Sem teto: os andares seguem indefinidamente.
 *  - Dificuldade real: cada andar exige um CP mínimo que cresce; a chance de
 *    vitória sai da comparação entre o SEU poder e a exigência do andar.
 *  - Recompensa proporcional ao XP do próximo nível E ao andar, para continuar
 *    valendo a pena no andar 10 e no 5.000.
 *  - Marcos a cada 10 andares: bônus de coins e equipamento garantido.
 */

const dataService = require("../../services/dataService");
const { initializeUser, calcularXpNecessario } = require("../../services/xpService");
const { calculateCharacterStats, sortearEquipamentoDrop } = require("../../services/rpgEquipmentService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

/** CP exigido pelo andar — cresce rápido, mas sem explodir. */
function exigenciaDoAndar(andar) {
    return Math.floor(80 * Math.pow(andar, 1.28) + andar * 45);
}

/** Chance de vitória a partir do seu poder x exigência (entre 12% e 93%). */
function chanceVitoria(cp, exigencia) {
    const razao = cp / Math.max(1, exigencia);
    const bruta = 0.15 + razao * 0.55;
    return Math.max(0.12, Math.min(0.93, bruta));
}

module.exports = {
    name: "torre",
    aliases: ["torredesafios", "escalar"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Escale a Torre dos Desafios — andares infinitos, cada um mais difícil",
    cooldownMs: 4000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const andar = Math.max(1, user.towerFloor || 1);
        const exigencia = exigenciaDoAndar(andar);
        const stats = calculateCharacterStats(user);
        const cp = stats.cp || 1;
        const chance = chanceVitoria(cp, exigencia);
        const venceu = Math.random() < chance;

        const nivel = user.level || 1;
        // Escala com o NÍVEL (para não virar migalha no endgame) e com o ANDAR.
        const xpReward = Math.floor(calcularXpNecessario(nivel) * 0.05 * (1 + andar / 40)) + andar * 60;
        const coinsReward = Math.floor(andar * 260 + 500 + nivel * 25);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏰 *TORRE DOS DESAFIOS* 🏰   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `🗼 *Andar:* ${andar.toLocaleString("pt-BR")} _(infinita)_\n`;
        doc += `⚡ *Seu CP:* ${cp.toLocaleString("pt-BR")} | 🛡️ *Exigido:* ${exigencia.toLocaleString("pt-BR")}\n`;
        doc += `🎲 *Chance de vitória:* ${Math.round(chance * 100)}%\n\n`;

        if (!venceu) {
            user.towerRecorde = Math.max(user.towerRecorde || 0, andar - 1);
            dataService.saveUser(user);
            doc += `💀 *DERROTA NO ANDAR ${andar.toLocaleString("pt-BR")}!*\n\n`;
            doc += `O guardião repeliu seu avanço.\n`;
            doc += `💡 _Aumente seu CP: _\`.forjar\`_, _\`.shoparmas\`_, _\`.shoparmaduras\`_._\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        user.towerFloor = andar + 1;
        user.towerRecorde = Math.max(user.towerRecorde || 0, andar);
        user.xp = (user.xp || 0) + xpReward;
        user.coins = (user.coins || 0) + coinsReward;

        // Marco a cada 10 andares: bônus + equipamento garantido.
        const marco = andar % 10 === 0;
        let bonusCoins = 0;
        if (marco) {
            bonusCoins = andar * 900 + 3000;
            user.coins += bonusCoins;
        }

        // Equipamento: garantido no marco, 12% nos demais andares.
        let drop = null;
        const cabeMochila = (user.inventario || []).length < (user.mochila || 20);
        if (cabeMochila && (marco || Math.random() < 0.12)) {
            drop = sortearEquipamentoDrop(nivel + Math.floor(andar / 5));
            if (drop) {
                if (!Array.isArray(user.inventario)) user.inventario = [];
                user.inventario.push({ ...drop });
            }
        }

        dataService.saveUser(user);
        logger.info(`[TORRE] ${sender} conquistou o andar ${andar}`);

        doc += `🏆 *ANDAR ${andar.toLocaleString("pt-BR")} CONQUISTADO!*\n\n`;
        doc += `╭━〔 🎁 RECOMPENSAS 〕━⬣\n`;
        doc += `┃ ⭐ *XP:* +${xpReward.toLocaleString("pt-BR")}\n`;
        doc += `┃ 💰 *Coins:* +${coinsReward.toLocaleString("pt-BR")}\n`;
        if (marco) doc += `┃ 🎉 *MARCO DE ${andar} ANDARES:* +${bonusCoins.toLocaleString("pt-BR")} coins\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (drop) {
            doc += `✨ *EQUIPAMENTO ${marco ? "DO MARCO" : "ENCONTRADO"}!*\n`;
            doc += `${drop.raridade} *${drop.nome}*\n`;
            doc += `⚔️ ATK +${drop.atk} | 🛡️ DEF +${drop.def} | ⚡ ${drop.cp} CP\n`;
            doc += `💡 _Equipe com_ \`.equipar ${drop.id}\`\n\n`;
        } else if (!cabeMochila) {
            doc += `🎒 _Mochila cheia — nenhum equipamento coletado._\n\n`;
        }

        doc += `🚪 *Próximo:* Andar ${(andar + 1).toLocaleString("pt-BR")} (exige ${exigenciaDoAndar(andar + 1).toLocaleString("pt-BR")} CP)\n`;
        doc += `🏅 *Seu recorde:* Andar ${(user.towerRecorde || andar).toLocaleString("pt-BR")}\n\n`;
        doc += `👑 *${botName}*`;
        return reply(doc.trim());
    }
};
