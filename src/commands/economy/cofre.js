/**
 * Comando .cofre / .poupanca / .investimentocofre
 * Sistema de cofre particular blindado com rendimento diário de juros compostos
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "cofre",
    aliases: ["poupanca", "investimentocofre", "meucofre", "guardar-cofre"],
    category: "economy",
    description: "Guarde moedas no cofre blindado que rende 1.5% ao dia e protege contra roubos",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.cofre = user.cofre || { saldo: 0, ultimoRendimento: Date.now() };

        const sub = (args[0] || "").toLowerCase().trim();
        const agora = Date.now();
        const umDiaMs = 24 * 60 * 60 * 1000;

        // Calcular rendimento passivo se passou mais de 24h
        if (user.cofre.saldo > 0 && agora - user.cofre.ultimoRendimento >= umDiaMs) {
            const dias = Math.floor((agora - user.cofre.ultimoRendimento) / umDiaMs);
            const taxa = 0.015; // 1.5% ao dia
            const rendimento = Math.floor(user.cofre.saldo * Math.pow(1 + taxa, dias) - user.cofre.saldo);
            user.cofre.saldo += rendimento;
            user.cofre.ultimoRendimento = agora;
            await dataService.saveXpData(xpData);
        }

        if (!sub || sub === "saldo" || sub === "status") {
            const card = renderCard({
                title: "COFRE BLINDADO DE LIONES",
                icon: "🔐",
                subtitle: `🛡️ *Titular:* @${sender.split("@")[0]}`,
                sections: [
                    {
                        title: "SEUS ATIVOS BLINDADOS",
                        icon: "💰",
                        fields: [
                            { label: "Saldo no Cofre", value: formatCoins(user.cofre.saldo), icon: "💎" },
                            { label: "Rendimento Diário", value: "+1.5% ao dia (Juros Compostos)", icon: "📈" },
                            { label: "Proteção Contra Roubos", value: "🛡️ 100% Imune a `.roubar`", icon: "🔒" }
                        ]
                    },
                    {
                        title: "OPERAÇÕES DISPONÍVEIS",
                        icon: "⚙️",
                        fields: [
                            "• `.cofre guardar <valor|all>` ➔ Deposita moedas da carteira no cofre",
                            "• `.cofre retirar <valor|all>` ➔ Saca moedas do cofre para a carteira"
                        ]
                    }
                ],
                tip: "Moedas no cofre rendem automaticamente todo dia e ninguém pode roubá-las!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "guardar" || sub === "depositar") {
            let valor = args[1]?.toLowerCase() === "all" ? (user.coins || 0) : parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply("❌ Informe uma quantia válida para guardar (ex: `.cofre guardar 1000` ou `.cofre guardar all`).");
            }

            if ((user.coins || 0) < valor) {
                return reply(`❌ *Saldo insuficiente!* Você possui apenas *${formatCoins(user.coins || 0)}* na carteira.`);
            }

            user.coins -= valor;
            user.cofre.saldo += valor;
            user.cofre.ultimoRendimento = agora;
            await dataService.saveXpData(xpData);

            return reply(`🔐 *MOEDAS GUARDADAS NO COFRE!*\n\n💎 *Depositado:* ${formatCoins(valor)}\n📊 *Novo Saldo no Cofre:* ${formatCoins(user.cofre.saldo)}\n📈 Seu saldo já está rendendo 1.5% ao dia!`);
        }

        if (sub === "retirar" || sub === "sacar") {
            let valor = args[1]?.toLowerCase() === "all" ? user.cofre.saldo : parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply("❌ Informe uma quantia válida para retirar (ex: `.cofre retirar 500` ou `.cofre retirar all`).");
            }

            if (user.cofre.saldo < valor) {
                return reply(`❌ *Saldo no cofre insuficiente!* Você possui *${formatCoins(user.cofre.saldo)}* no cofre.`);
            }

            user.cofre.saldo -= valor;
            user.coins = (user.coins || 0) + valor;
            await dataService.saveXpData(xpData);

            return reply(`🔓 *RETIRADA REALIZADA!*\n\n💰 *Sacado:* ${formatCoins(valor)}\n👛 *Saldo Disponível na Carteira:* ${formatCoins(user.coins)}`);
        }
    }
};

