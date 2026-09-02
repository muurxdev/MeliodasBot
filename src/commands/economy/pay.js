/**
 * MeliodasBot — Comando .pay / .transferir / .pix
 * Transfere Coins com segurança entre usuários com auditoria no SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { recordTransaction } = require("../../database/repositories/transactionRepository");
const { renderCard, formatCoins } = require("../../utils/uiEngine");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "pay",
    aliases: ["pagar", "transferir", "doar", "pixcoins", "enviarpix", "pix"],
    category: "economy",
    description: "Transfere moedas da sua carteira para outro usuário com registro no extrato",
    cooldownMs: 2000,
    execute: async ({ sender, info, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const senderProfile = initializeUser(sender, xpData);

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        let targetJid = mentioned;

        let amountArg = null;
        if (mentioned) {
            amountArg = args.find(a => /^[0-9]+$/.test(a));
        } else if (args[0] && args[0].replace(/\D/g, "").length >= 8 && args[1]) {
            targetJid = args[0].replace(/\D/g, "") + "@s.whatsapp.net";
            amountArg = args[1];
        }

        if (!targetJid || !amountArg) {
            const helpDoc = renderCard({
                title: "TRANSFERÊNCIA DE MOEDAS",
                icon: "💸",
                sections: [
                    {
                        title: "INSTRUÇÕES DE USO",
                        icon: "📌",
                        fields: [
                            "• `.pay @usuario <valor>` ➔ Transfere moedas marcando o contato",
                            "• `.pay 5511999999999 <valor>` ➔ Transfere informando o número",
                            `• Seu Saldo Atual: *${formatCoins(senderProfile.coins || 0)}*`
                        ]
                    }
                ],
                tip: "Transfira moedas para seus amigos ou pague por itens e serviços!",
                mentions: [sender]
            });
            return reply(helpDoc);
        }

        if (targetJid === sender) {
            return reply("❌ Você não pode transferir moedas para si mesmo!");
        }

        const amount = parseInt(amountArg, 10);
        if (isNaN(amount) || amount <= 0) {
            return reply("❌ O valor a transferir deve ser um número inteiro maior que zero.");
        }

        if ((senderProfile.coins || 0) < amount) {
            return reply(`❌ *Saldo insuficiente!* Você possui *${formatCoins(senderProfile.coins || 0)}* na carteira.`);
        }

        const recipientProfile = initializeUser(targetJid, xpData);

        // Realiza transferência atômica
        senderProfile.coins = (senderProfile.coins || 0) - amount;
        recipientProfile.coins = (recipientProfile.coins || 0) + amount;

        await dataService.saveXpData(xpData);
        logger.info(`[PAY] ${sender} transferiu ${amount} coins para ${targetJid}`);

        // Registra transação para ambos os usuários no SQLite
        recordTransaction({
            userJid: sender,
            targetJid: targetJid,
            type: "PIX ENVIADO",
            amount: -amount,
            balanceAfter: senderProfile.coins,
            description: `Transferência Pix enviada para @${targetJid.split("@")[0]}`
        });

        recordTransaction({
            userJid: targetJid,
            targetJid: sender,
            type: "PIX RECEBIDO",
            amount: amount,
            balanceAfter: recipientProfile.coins,
            description: `Transferência Pix recebida de @${sender.split("@")[0]}`
        });

        const doc = renderCard({
            title: "TRANSFERÊNCIA CONCLUÍDA",
            icon: "💸",
            subtitle: `✨ *Transferência Pix de ${formatCoins(amount)} realizada com sucesso!*`,
            sections: [
                {
                    title: "DADOS DA TRANSAÇÃO",
                    icon: "📜",
                    fields: [
                        { label: "Remetente", value: `@${sender.split("@")[0]}`, icon: "📤" },
                        { label: "Destinatário", value: `@${targetJid.split("@")[0]}`, icon: "📥" },
                        { label: "Valor Transferido", value: formatCoins(amount), icon: "💰" },
                        { label: "Seu Saldo Restante", value: formatCoins(senderProfile.coins), icon: "💵" }
                    ]
                }
            ],
            tip: "Transação auditada e registrada permanentemente no banco SQLite!",
            mentions: [sender, targetJid]
        });

        return reply(doc, [sender, targetJid]);
    }
};
