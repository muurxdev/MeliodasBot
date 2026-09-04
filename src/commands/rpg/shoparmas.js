/**
 * Comando .shoparmas / .lojaarmas / .comprararma
 * Arsenal e loja de armas brancas, mágicas e tesouros sagrados
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "shoparmas",
    aliases: ["lojaarmas", "comprararma", "armas", "arsenal"],
    category: "rpg",
    description: "Loja especializada em espadas, machados e tesouros sagrados de Britânia",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();

        const weapons = Object.values(ITEMS_DB).filter(i => i.slot === "arma");

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot !== "arma") {
                return reply(`❌ Arma *"${buyQuery}"* não encontrada no arsenal.`);
            }

            if ((user.coins || 0) < item.preco) {
                return reply(`❌ Você não tem coins suficientes! *${item.nome}* custa *${item.preco.toLocaleString("pt-BR")} Coins* (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= item.preco;
            if (!Array.isArray(user.inventario)) user.inventario = [];
            user.inventario.push({ ...item });

            if (!user.slots) user.slots = {};
            user.slots.arma = item.id;
            user.arma = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🗡️ *ARMA FORJADA COM SUCESSO* 🗡️  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *Você adquiriu e empunhou:* *${item.nome}*\n`;
            doc += `💎 *Raridade:* ${item.raridade}\n`;
            doc += `⚔️ *Ataque (ATK):* +${item.atk} | 🎯 *Crítico:* +${item.crit}%\n`;
            doc += `💰 *Preço Pago:* ${item.preco.toLocaleString("pt-BR")} Coins\n`;
            doc += `⚡ *Novo Poder de Combate (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🗡️ *ARSENAL DE BRITÂNIA* 🗡️    ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;

        weapons.forEach(w => {
            doc += `╭━〔 ${w.raridade} 〕━⬣\n`;
            doc += `┃ 🗡️ *${w.nome}*\n`;
            doc += `┃ ⚔️ ATK: +${w.atk} | 🎯 Crit: +${w.crit}% | ⚡ +${w.cp} CP\n`;
            doc += `┃ 💵 *Preço:* *${w.preco.toLocaleString("pt-BR")} Coins*\n`;
            doc += `┃ 🛒 *Comprar:* \`.shoparmas ${w.id}\`\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

