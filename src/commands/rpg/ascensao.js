/**
 * Comando .ascensao
 * Árvore de Ascensão Espiritual e Graus Cósmicos do Guerreiro
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

const ASCENSION_TIERS = [
    { nivel: 1, nome: "🌟 Mortal Desperto", bonus: "+25% Dano Global", req: "1x Rebirth" },
    { nivel: 2, nome: "⚡ Cavaleiro Espiritual", bonus: "+50% Dano & +50% XP", req: "2x Rebirth" },
    { nivel: 3, nome: "🔥 Soberano dos Elementos", bonus: "+75% Dano & +75% XP", req: "3x Rebirth" },
    { nivel: 5, nome: "🪽 Semideus Primordial", bonus: "+125% Dano & Asas Celestiais", req: "5x Rebirth" },
    { nivel: 10, nome: "👑 Divindade Suprema", bonus: "+250% Dano & Poder Cósmico Máximo", req: "10x Rebirth" }
];

module.exports = {
    name: "ascensao",
    aliases: ["ascender", "arvoreascensao", "grausascensao"],
    category: "rpg",
    description: "Exibe a árvore de ascensão cósmica e os bônus permanentes de Rebirth",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const info = getRebirthInfo(user);
        const stats = calculateFullCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌌 *ÁRVORE DE ASCENSÃO CÓSMICA* 🌌   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Guerreiro:* @${sender.split("@")[0]}\n`;
        doc += `🌀 *Rebirths Concluídos:* **${info.rebirths} / ${info.maxRebirths} Graus**\n`;
        doc += `💥 *Bônus Permanente Atual:* **+${info.bonusDmgPercent}% Dano & XP Totais**\n\n`;

        doc += `╭━〔 📜 GRAUS DE TRANSCENDÊNCIA 〕━⬣\n`;
        ASCENSION_TIERS.forEach(t => {
            const alcancado = info.rebirths >= t.nivel;
            const icon = alcancado ? "🟢 [ATINGIDO]" : "🔒 [BLOQUEADO]";
            doc += `┃ ${icon} *Grau ${t.nivel}:* ${t.nome}\n`;
            doc += `┃    📜 *Bônus:* ${t.bonus}\n`;
            doc += `┃    📌 *Requisito:* ${t.req}\n┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para avançar na árvore de ascensão, atinja o nível 100 e use \`.reencarnar\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
