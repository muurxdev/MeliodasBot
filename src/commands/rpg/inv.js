/**
 * Comando .inv / .inventario / .itens
 * Painel completo de Inventário com visualização dos 7 Slots de Equipamentos, Loots, Minérios e Capacidade
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { getItem } = require('../../services/rpgEquipmentService');
const { calculateFullCharacterStats, renderCharacterAvatar } = require('../../services/characterEngine');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'inv',
    aliases: ['itens', 'meusitens', 'equipamentos', 'inventory'],
    category: 'rpg',
    description: 'Exibe seus slots de equipamentos ativos, itens da mochila, minérios e loots',
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const slots = user.slots || {};
        const inventario = Array.isArray(user.inventario) ? user.inventario : [];
        const limiteMochila = user.mochila || 20;

        // Formatação dos 7 Slots Ativos
        const getSlotName = (ref, defaultName) => {
            if (!ref) return `_Vazio (${defaultName})_`;
            if (typeof ref === 'object') return `*${ref.nome || ref.name}*`;
            const it = getItem(ref);
            return it ? `*${it.nome}* (${it.raridade || '⚪ Comum'})` : `*${ref}*`;
        };

        const helmStr = getSlotName(slots.capacete, "Sem Elmo");
        const chestStr = getSlotName(slots.peitoral, "Sem Armadura");
        const pantsStr = getSlotName(slots.calca, "Sem Calças");
        const bootsStr = getSlotName(slots.botas, "Sem Botas");
        const weaponStr = getSlotName(slots.arma || user.arma, "Punhos");
        const shieldStr = getSlotName(slots.escudo, "Sem Escudo");
        const amuletStr = getSlotName(slots.amuleto, "Sem Amuleto");

        // Separação de Loots e Itens
        const lootBoss = inventario.filter(item =>
            typeof item === 'string' && (
                item.includes('Chip') || item.includes('Cristal') || item.includes('Núcleo') ||
                item.includes('Chama') || item.includes('Exploit') || item.includes('Escama') ||
                item.includes('Coroa') || item.includes('Trevas') || item.includes('Asas') ||
                item.includes('Mítico') || item.includes('Mandamento')
            )
        );

        const lootMobs = inventario.filter(item =>
            typeof item === 'string' && (
                item.includes('Fragmento') || item.includes('Asa') || item.includes('Casca') ||
                item.includes('Gosma') || item.includes('Log') || item.includes('Chave') ||
                item.includes('Pena') || item.includes('Crânio') || item.includes('Sangue')
            )
        );

        const outrosItens = inventario.filter(item => !lootBoss.includes(item) && !lootMobs.includes(item));

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        doc += `┃   📦 *INVENTÁRIO DO GUERREIRO* 📦   \n`;
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        doc += `👤 *Guerreiro:* @${sender.split('@')[0]}\n`;
        doc += `⚡ *Poder de Combate (CP):* **${stats.cp.toLocaleString('pt-BR')} CP**\n`;
        doc += `🎒 *Capacidade da Mochila:* **${inventario.length} / ${limiteMochila} espaços**\n`;
        doc += `🪙 *Saldo Atual:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n\n`;

        doc += `╭━━━〔 🛡️ SLOTS DE EQUIPAMENTOS ATIVOS 〕━━━┈⊷\n`;
        doc += `┃ 👑 *Cabeça:* ${helmStr}\n`;
        doc += `┃ 🛡️ *Tronco:* ${chestStr}\n`;
        doc += `┃ 👖 *Pernas:* ${pantsStr}\n`;
        doc += `┃ 👢 *Pés:* ${bootsStr}\n`;
        doc += `┃ 🗡️ *Arma Principal:* ${weaponStr} (+${user.forgeLevel || 0} Forja)\n`;
        doc += `┃ 🛡️ *Mão Secundária:* ${shieldStr}\n`;
        doc += `┃ 💍 *Amuleto:* ${amuletStr}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        doc += `╭━━━〔 🎒 ITENS & CONSUMÍVEIS NA MOCHILA 〕━━━┈⊷\n`;
        if (outrosItens.length > 0) {
            outrosItens.forEach(i => { doc += `┃ • ${i}\n`; });
        } else {
            doc += `┃ _Nenhum consumível no momento._\n`;
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        if (lootBoss.length > 0) {
            doc += `╭━━━〔 🐉 LOOTS DE BOSSES 〕━━━┈⊷\n`;
            lootBoss.forEach(i => { doc += `┃ • ${i}\n`; });
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        }

        if (lootMobs.length > 0) {
            doc += `╭━━━〔 👾 MATERIAIS & DROPS DE MOBS 〕━━━┈⊷\n`;
            lootMobs.slice(0, 8).forEach(i => { doc += `┃ • ${i}\n`; });
            if (lootMobs.length > 8) doc += `┃ _...e mais ${lootMobs.length - 8} itens._\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        }

        doc += `💡 _Para equipar itens:_ \`.equipar <nome>\` | _Para guardar no armazém seguro:_ \`.bau guardar <item>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};