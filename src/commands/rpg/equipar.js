/**
 * Comando .equipar / .equip / .vestir
 * Equipa armas, capacetes, peitorais, perneiras, botas, escudos e amuletos nos slots do boneco
 */

const { getBotName } = require("../../config/botConfig");
const env = require("../../config/env");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");

module.exports = {
    name: "equipar",
    aliases: ["vestir", "usaritem", "colocararmadura", "empunhar"],
    category: "rpg",
    description: "Equipa um item do seu inventário no slot correspondente do seu boneco",
    cooldownMs: 1500,
    execute: async ({ sender, text, reply }) => {
        const botName = getBotName();
        const itemName = (text || "").trim();

        if (!itemName) {
            return reply(
                "❌ *Informe o nome do equipamento que deseja equipar!*\n\n" +
                "📌 *Exemplos:*\n" +
                "• `.equipar Espada de Ferro`\n" +
                "• `.equipar Peitoral de Ferro`\n" +
                "• `.equipar Lostvayne`\n" +
                "• `.equipar Botas Aladas de Hermes`"
            );
        }

        const item = getItem(itemName);
        if (!item) {
            return reply(`❌ Equipamento *"${itemName}"* não foi encontrado nos registros de Britânia.`);
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        if (!user.slots) {
            user.slots = { capacete: null, peitoral: null, calca: null, botas: null, arma: null, escudo: null, amuleto: null };
        }

        // Verifica posse no inventário
        const hasItem = Array.isArray(user.inventario) && user.inventario.some(i => {
            const id = typeof i === "object" ? i.id : i;
            const name = typeof i === "object" ? i.nome : i;
            return id === item.id || name?.toLowerCase().includes(item.nome.toLowerCase());
        });

        // Se for o dono do bot ou se tiver no inventário, ou item básico inicial
        const isOwner = Boolean(user.isOwner || env.isOwnerJid(sender));
        if (!hasItem && !isOwner && item.preco > 500) {
            return reply(`❌ Você não possui *${item.nome}* no seu inventário. Adquira na loja com \`.shoparmas\` ou \`.shoparmaduras\`.`);
        }

        const targetSlot = item.slot;
        const previousItem = user.slots[targetSlot];

        user.slots[targetSlot] = item.id;
        if (targetSlot === "arma") {
            user.arma = item.id;
        }

        await dataService.saveXpData(xpData);
        const stats = calculateCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚔️ *EQUIPAMENTO EQUIPADO* ⚔️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `✨ *Você equipou:* *${item.nome}*\n`;
        doc += `🏷️ *Slot:* *${targetSlot.toUpperCase()}*\n`;
        doc += `💎 *Raridade:* ${item.raridade}\n\n`;

        doc += `╭━〔 📈 BÔNUS APLICADOS 〕━⬣\n`;
        if (item.atk) doc += `┃ ⚔️ *Ataque (ATK):* +${item.atk}\n`;
        if (item.def) doc += `┃ 🛡️ *Defesa (DEF):* +${item.def}\n`;
        if (item.hp) doc += `┃ ❤️ *Vida (HP):* +${item.hp}\n`;
        if (item.crit) doc += `┃ 🎯 *Crítico:* +${item.crit}%\n`;
        if (item.esq) doc += `┃ 💨 *Esquiva:* +${item.esq}%\n`;
        if (item.bloq) doc += `┃ 🛡️ *Bloqueio:* +${item.bloq}%\n`;
        doc += `┃ ⚡ *Novo Poder (CP):* *${stats.cp.toLocaleString("pt-BR")} CP*\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Digite \`.boneco\` para ver todos os seus slots equipados._\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

