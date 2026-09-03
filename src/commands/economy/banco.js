/**
 * Comando .banco / .bank / .extrato / .depositar / .sacar
 * Sistema Bancário Seguro com Extrato em Tempo Real e Persistência SQLite
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { recordTransaction, getUserTransactions } = require("../../database/repositories/transactionRepository");
const { renderCard, formatCoins, formatNumber } = require("../../utils/uiEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "banco",
    aliases: ["bank", "depositar", "sacar", "dep", "saque", "saldo", "extrato", "cofrinho"],
    category: "economy",
    description: "Gerencie sua conta bancária segura, consulte extrato detalhado e proteja seus Coins",
    cooldownMs: 1500,
    execute: async ({ sender, args, reply, commandName }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        user.bank = Number(user.bank || user.banco || 0);
        user.banco = user.bank;

        let action = (args[0] || commandName || "").toLowerCase().trim();
        let valArg = args[1];

        if (commandName === "depositar" || commandName === "dep") {
            action = "depositar";
            valArg = args[0];
        } else if (commandName === "sacar" || commandName === "saque") {
            action = "sacar";
            valArg = args[0];
        } else if (commandName === "extrato") {
            action = "extrato";
        }

        // 1. EXTRATO FINANCEIRO DETALHADO
        if (action === "extrato" || action === "historico" || action === "transacoes") {
            const txs = getUserTransactions(sender, 8);
            const totalPatrimonio = (user.coins || 0) + user.bank;

            let txFields = [];
            if (txs.length === 0) {
                txFields.push("Nenhuma movimentação registrada recentemente.");
            } else {
                for (const tx of txs) {
                    const icon = tx.amount >= 0 ? "🟢" : "🔴";
                    const formattedAmt = `${tx.amount >= 0 ? "+" : ""}${formatCoins(tx.amount)}`;
                    const dateStr = new Date(tx.created_at).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    txFields.push(`${icon} *${tx.type}:* ${formattedAmt} _(${dateStr})_\n   ┗ 💬 _${tx.description || "Sem descrição"}_`);
                }
            }

            const doc = renderCard({
                title: "EXTRATO BANCÁRIO DETALHADO",
                icon: "📜",
                subtitle: `👤 *Titular:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "RESUMO PATRIMONIAL",
                        icon: "💳",
                        fields: [
                            { label: "Carteira", value: formatCoins(user.coins || 0), icon: "💰" },
                            { label: "Cofre Bancário", value: formatCoins(user.bank), icon: "🏦" },
                            { label: "Patrimônio Total", value: formatCoins(totalPatrimonio), icon: "💎" }
                        ]
                    },
                    {
                        title: "ÚLTIMAS MOVIMENTAÇÕES (SQLITE)",
                        icon: "📊",
                        fields: txFields
                    }
                ],
                tip: "Use .banco depositar <valor> para proteger seu dinheiro contra roubos!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 2. DEPOSITAR COINS NO BANCO
        if (action === "depositar" || action === "dep") {
            const walletCoins = user.coins || 0;
            if (walletCoins <= 0) {
                return reply("❌ Você não possui moedas na carteira para depositar.");
            }

            let amount = 0;
            if (valArg === "all" || valArg === "tudo" || valArg === "max") {
                amount = walletCoins;
            } else {
                amount = parseInt(valArg, 10);
            }

            if (isNaN(amount) || amount <= 0) {
                return reply("❌ Informe uma quantia válida para depósito.\n\n📌 *Exemplo:* `.banco depositar 500` ou `.depositar all`");
            }

            if (amount > walletCoins) {
                return reply(`❌ Saldo insuficiente na carteira! Você possui *${formatCoins(walletCoins)}*.`);
            }

            user.coins = walletCoins - amount;
            user.bank = user.bank + amount;
            user.banco = user.bank;
            dataService.saveUser(user);

            // Grava no extrato
            recordTransaction({
                userJid: sender,
                type: "DEPÓSITO",
                amount: amount,
                balanceAfter: user.bank,
                description: `Depósito no cofre bancário central`
            });

            const doc = renderCard({
                title: "DEPÓSITO REALIZADO",
                icon: "🏦",
                subtitle: `📥 *Valor Depositado:* +${formatCoins(amount)}`,
                sections: [
                    {
                        title: "EXTRATO ATUALIZADO",
                        icon: "💳",
                        fields: [
                            { label: "Cofre Bancário", value: `${formatCoins(user.bank)} (100% Protegido 🛡️)`, icon: "🏦" },
                            { label: "Carteira", value: formatCoins(user.coins), icon: "💰" }
                        ]
                    }
                ],
                tip: "Seu dinheiro no cofre está seguro contra ladrões e apostas acidentais.",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 3. SACAR COINS DO BANCO
        if (action === "sacar" || action === "saque") {
            const bankCoins = user.bank || 0;
            if (bankCoins <= 0) {
                return reply("❌ Você não possui moedas no cofre para sacar.");
            }

            let amount = 0;
            if (valArg === "all" || valArg === "tudo" || valArg === "max") {
                amount = bankCoins;
            } else {
                amount = parseInt(valArg, 10);
            }

            if (isNaN(amount) || amount <= 0) {
                return reply("❌ Informe uma quantia válida para saque.\n\n📌 *Exemplo:* `.banco sacar 500` ou `.sacar all`");
            }

            if (amount > bankCoins) {
                return reply(`❌ Saldo bancário insuficiente! Você possui *${formatCoins(bankCoins)}* no cofre.`);
            }

            user.bank = bankCoins - amount;
            user.banco = user.bank;
            user.coins = (user.coins || 0) + amount;
            dataService.saveUser(user);

            // Grava no extrato
            recordTransaction({
                userJid: sender,
                type: "SAQUE",
                amount: -amount,
                balanceAfter: user.bank,
                description: `Saque efetuado do cofre bancário`
            });

            const doc = renderCard({
                title: "SAQUE REALIZADO",
                icon: "🏦",
                subtitle: `📤 *Valor Sacado:* +${formatCoins(amount)} para a carteira`,
                sections: [
                    {
                        title: "EXTRATO ATUALIZADO",
                        icon: "💳",
                        fields: [
                            { label: "Carteira", value: formatCoins(user.coins), icon: "💰" },
                            { label: "Cofre Bancário", value: formatCoins(user.bank), icon: "🏦" }
                        ]
                    }
                ],
                tip: "Cuidado com o comando .roubar enquanto o dinheiro estiver na carteira!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 4. PAINEL PRINCIPAL DO BANCO
        const totalCoins = (user.coins || 0) + user.bank;
        const doc = renderCard({
            title: "BANCO CENTRAL MELIODAS",
            icon: "🏦",
            subtitle: `👤 *Titular:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESERVAS FINANCEIRAS",
                    icon: "💳",
                    fields: [
                        { label: "Carteira", value: `${formatCoins(user.coins || 0)} (Suscetível a furtos ⚠️)`, icon: "💰" },
                        { label: "Cofre Bancário", value: `${formatCoins(user.bank)} (100% Seguro 🛡️)`, icon: "🏦" },
                        { label: "Patrimônio Líquido", value: formatCoins(totalCoins), icon: "💎" }
                    ]
                },
                {
                    title: "OPERAÇÕES DISPONÍVEIS",
                    icon: "⚙️",
                    fields: [
                        "📥 `.banco depositar <quantia|all>` ➔ Guardar moedas no cofre",
                        "📤 `.banco sacar <quantia|all>` ➔ Retirar moedas para a carteira",
                        "📜 `.banco extrato` ➔ Visualizar histórico detalhado de transações"
                    ]
                }
            ],
            tip: "Use .extrato para consultar suas transferências e histórico SQLite!",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};
