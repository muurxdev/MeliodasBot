/**
 * MeliodasBot — Comando .bau / .deposito / .sacar / .armazem
 * Armazém Seguro de Retaguarda no SQLite para guardar moedas e equipamentos sem lotar a mochila
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const vaultRepo = require('../../database/repositories/vaultRepository');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'bau',
    aliases: ['vault', 'armazem', 'deposito', 'guardar', 'sacar', 'cofre-rpg'],
    category: 'rpg',
    description: 'Armazém seguro persistente para estocar equipamentos, minérios e moedas',
    cooldownMs: 2500,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || '').toLowerCase().trim();
        const param = args.slice(1).join(' ').trim();

        const vaultCoins = vaultRepo.getVaultCoins(sender);
        const vaultItems = vaultRepo.getVaultItems(sender);

        // 1. DEPOSITAR MOEDAS
        if (sub === 'depositar' || sub === 'dep' || sub === 'guardarcoins') {
            const qtd = param.toLowerCase() === 'tudo' ? (user.coins || 0) : parseInt(param, 10);
            if (isNaN(qtd) || qtd <= 0) {
                return reply(`📌 *Como depositar moedas:* \`.bau depositar <quantidade>\` ou \`.bau depositar tudo\``);
            }

            if ((user.coins || 0) < qtd) {
                return reply(`❌ Saldo insuficiente na carteira (Você possui: ${(user.coins || 0).toLocaleString('pt-BR')} Coins).`);
            }

            user.coins -= qtd;
            vaultRepo.depositVaultCoins(sender, qtd);
            await dataService.saveXpData(xpData);

            const newVaultCoins = vaultRepo.getVaultCoins(sender);

            return reply(`🔒 *DEPÓSITO NO BAÚ REALIZADO!*\n\n💰 *Moedas Guardadas:* +${qtd.toLocaleString('pt-BR')} Coins\n🪙 *Total no Baú:* **${newVaultCoins.toLocaleString('pt-BR')} Coins**\n💵 *Saldo na Carteira:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins`);
        }

        // 2. SACAR MOEDAS
        if (sub === 'sacar' || sub === 'retirarcoins' || sub === 'saque') {
            const qtd = param.toLowerCase() === 'tudo' ? vaultCoins : parseInt(param, 10);
            if (isNaN(qtd) || qtd <= 0) {
                return reply(`📌 *Como sacar moedas:* \`.bau sacar <quantidade>\` ou \`.bau sacar tudo\``);
            }

            if (vaultCoins < qtd) {
                return reply(`❌ Saldo insuficiente no baú (Você tem: ${vaultCoins.toLocaleString('pt-BR')} Coins guardados).`);
            }

            vaultRepo.withdrawVaultCoins(sender, qtd);
            user.coins = (user.coins || 0) + qtd;
            await dataService.saveXpData(xpData);

            const newVaultCoins = vaultRepo.getVaultCoins(sender);

            return reply(`🔓 *SAQUE DO BAÚ REALIZADO!*\n\n💸 *Moedas Sacadas:* +${qtd.toLocaleString('pt-BR')} Coins\n🪙 *Restante no Baú:* **${newVaultCoins.toLocaleString('pt-BR')} Coins**\n💵 *Saldo na Carteira:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins`);
        }

        // 3. GUARDAR ITEM DO INVENTÁRIO NO BAÚ
        if (sub === 'guardar' || sub === 'estocar') {
            if (!param) {
                return reply(`📌 *Como guardar itens:* \`.bau guardar <nome_do_item>\`\n👉 *Exemplo:* \`.bau guardar Escama de Dragão\``);
            }

            if (!Array.isArray(user.inventario) || user.inventario.length === 0) {
                return reply(`📦 Seu inventário está vazio. Nenhum item para guardar.`);
            }

            const itemIdx = user.inventario.findIndex(i => typeof i === 'string' && i.toLowerCase().includes(param.toLowerCase()));
            if (itemIdx === -1) {
                return reply(`❌ Você não possui o item *"${param}"* no seu inventário.`);
            }

            const itemGuardado = user.inventario.splice(itemIdx, 1)[0];
            vaultRepo.addVaultItem(sender, itemGuardado, 1);
            await dataService.saveXpData(xpData);

            return reply(`🔒 *ITEM GUARDADO COM SEGURANÇA NO BAÚ!*\n\n📦 *Item:* ${itemGuardado}\n🛡️ *Status:* Protegido contra perdas em mortes ou ataques!\n🎒 *Espaço liberado na mochila:* ${user.inventario.length} / ${user.mochila || 20}`);
        }

        // 4. RETIRAR ITEM DO BAÚ PARA O INVENTÁRIO
        if (sub === 'retirar' || sub === 'pegar') {
            if (!param) {
                return reply(`📌 *Como retirar itens:* \`.bau retirar <nome_do_item>\`\n👉 *Exemplo:* \`.bau retirar Escama\``);
            }

            const targetItem = vaultItems.find(i => i.item_name.toLowerCase().includes(param.toLowerCase()) || i.item_id.toLowerCase().includes(param.toLowerCase()));
            if (!targetItem) {
                return reply(`❌ O item *"${param}"* não foi encontrado no seu baú.`);
            }

            if (!Array.isArray(user.inventario)) user.inventario = [];
            const limiteMochila = user.mochila || 20;
            if (user.inventario.length >= limiteMochila) {
                return reply(`🎒 Sua mochila está cheia (${user.inventario.length}/${limiteMochila}). Aumente o espaço com \`.mochila up\` ou guarde outros itens.`);
            }

            vaultRepo.removeVaultItem(sender, targetItem.item_id, 1);
            user.inventario.push(targetItem.item_name);
            await dataService.saveXpData(xpData);

            return reply(`🔓 *ITEM RETIRADO DO BAÚ!*\n\n📦 *Item:* ${targetItem.item_name}\n🎒 *Transferido para a mochila:* ${user.inventario.length} / ${limiteMochila}`);
        }

        // 5. EXIBIR VISÃO GERAL DO BAÚ
        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        doc += `┃   🏛️ *BAÚ DE RETAGUARDA SEGURO* 🏛️   \n`;
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        doc += `👤 *Proprietário:* @${sender.split('@')[0]}\n`;
        doc += `🪙 *Saldo no Baú:* **${vaultCoins.toLocaleString('pt-BR')} Coins** (Protegido contra roubo)\n`;
        doc += `💵 *Saldo na Carteira:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins\n`;
        doc += `📦 *Total de Itens Estocados:* ${vaultItems.length} tipos de itens\n\n`;

        doc += `╭━━━〔 🛡️ ITENS ARMAZENADOS NO COFRE 〕━━━┈⊷\n`;
        if (vaultItems.length > 0) {
            vaultItems.forEach((it, idx) => {
                doc += `┃ ${idx + 1}. *${it.item_name}* (x${it.quantity})\n`;
            });
        } else {
            doc += `┃ _Nenhum equipamento guardado ainda._\n`;
        }
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        doc += `╭━━━〔 ⚙️ COMANDOS DO BAÚ 〕━━━┈⊷\n`;
        doc += `┃ • \`.bau depositar <qtd>\` ➔ Guardar moedas no cofre\n`;
        doc += `┃ • \`.bau sacar <qtd>\` ➔ Retirar moedas para a carteira\n`;
        doc += `┃ • \`.bau guardar <item>\` ➔ Guardar item do inventário\n`;
        doc += `┃ • \`.bau retirar <item>\` ➔ Retirar item para a mochila\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};

