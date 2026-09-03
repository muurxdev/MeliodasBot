/**
 * Comando .shoparmaduras / .lojaarmaduras / .comprararmadura
 * Forja e loja de armaduras (Capacetes, Peitorais, Calças, Botas, Escudos e Amuletos)
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "shoparmaduras",
    aliases: ["lojaarmaduras", "comprararmadura", "armaduras", "forjaequipamentos"],
    category: "rpg",
    description: "Loja especializada em armaduras, elmos, perneiras, botas, escudos e amuletos",
    cooldownMs: 2000,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();

        const armors = Object.values(ITEMS_DB).filter(i => i.slot !== "arma");

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot === "arma") {
                return reply(`❌ Armadura *"${buyQuery}"* não encontrada na forja.`);
            }

            if ((user.coins || 0) < item.preco) {
                return reply(`❌ Você não tem coins suficientes! *${item.nome}* custa *${item.preco.toLocaleString("pt-BR")} Coins* (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= item.preco;
            if (!Array.isArray(user.inventario)) user.inventario = [];
            user.inventario.push({ id: item.id, nome: item.nome, tipo: item.slot, def: item.def });

            if (!user.slots) user.slots = {};
            user.slots[item.slot] = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *ARMADURA EQUIPADA* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✨ *Você forjou e vestiu:* *${item.nome}*\n`;
            doc += `🏷️ *Slot:* ${item.slot.toUpperCase()}\n`;
            doc += `💎 *Raridade:* ${item.raridade}\n`;
            doc += `🛡️ *Defesa (DEF):* +${item.def} | ❤️ *Vida (HP):* +${item.hp}\n`;
            doc += `💰 *Preço Pago:* ${item.preco.toLocaleString("pt-BR")} Coins\n`;
            doc += `⚡ *Novo Poder de Combate (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim());
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *FORJA DE ARMADURAS* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `💰 *Seu Saldo:* *${(user.coins || 0).toLocaleString("pt-BR")} Coins*\n\n`;

        armors.slice(0, 12).forEach(a => {
            doc += `╭━〔 ${a.raridade} • ${a.slot.toUpperCase()} 〕━⬣\n`;
            doc += `┃ 🛡️ *${a.nome}*\n`;
            doc += `┃ 🛡️ DEF: +${a.def} | ❤️ HP: +${a.hp} | ⚡ +${a.cp} CP\n`;
            doc += `┃ 💵 *Preço:* *${a.preco.toLocaleString("pt-BR")} Coins*\n`;
            doc += `┃ 🛒 *Comprar:* \`.shoparmaduras ${a.id}\`\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        });

        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

