/**
 * MeliodasBot — Comando .tesourocoletivo / .baucoletivo / .pote
 * Baú coletivo do grupo que acumula moedas com a atividade e é sorteado entre os membros
 */

const { renderCard, renderProgressBar, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "tesourocoletivo",
    aliases: ["baucoletivo", "pote", "tesouro-grupo", "vaquinha-tesouro"],
    category: "economy",
    description: "Consulte ou resgate o baú coletivo de moedas acumuladas do grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, args }) => {
        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};
        configs[from].tesouro = configs[from].tesouro || { saldo: 5000, meta: 50000, contribuintes: {} };

        const t = configs[from].tesouro;
        const sub = (args[0] || "").toLowerCase().trim();

        if (!sub || sub === "status" || sub === "ver") {
            const pct = Math.min(100, Math.floor((t.saldo / t.meta) * 100));
            const barra = renderProgressBar(t.saldo, t.meta, 12, "gold");

            const card = renderCard({
                title: "BAÚ DO TESOURO COLETIVO",
                icon: "🪙",
                subtitle: `🏰 *Reino / Grupo:* Britânia Guild`,
                sections: [
                    {
                        title: "META COLETIVA DO BAÚ",
                        icon: "📊",
                        fields: [
                            { label: "Saldo Acumulado", value: formatCoins(t.saldo), icon: "💰" },
                            { label: "Meta de Liberação", value: formatCoins(t.meta), icon: "🎯" },
                            { label: "Progresso", value: `${barra} ${pct}%`, icon: "📈" }
                        ]
                    },
                    {
                        title: "COMO PARTICIPAR",
                        icon: "🤝",
                        fields: [
                            "• `.tesouro doar <valor>` ➔ Contribua com moedas para encher o baú",
                            "• `.tesouro abrir` ➔ Tente a sorte para abrir o baú quando atingir 100%!",
                            "• Cada mensagem enviada no grupo adiciona moedas automaticamente ao pote!"
                        ]
                    }
                ],
                tip: "Quando a meta for batida, qualquer membro ativo poderá disputar o tesouro!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "doar" || sub === "contribuir") {
            const valor = parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply("❌ Informe uma quantidade válida de moedas para doar (ex: `.tesouro doar 500`).");
            }

            const xpData = dataService.getXpData();
            const user = xpData[sender] || dataService.initializeUser(sender);

            if ((user.coins || 0) < valor) {
                return reply(`❌ *Saldo insuficiente!* Você possui apenas *${formatCoins(user.coins || 0)}*.`);
            }

            user.coins -= valor;
            t.saldo += valor;
            t.contribuintes[sender] = (t.contribuintes[sender] || 0) + valor;

            await dataService.saveXpData(xpData);
            await dataService.saveConfigsData(configs);

            return reply(`🎉 *DOAÇÃO RECEBIDA!*\n\n💰 Você doou *${formatCoins(valor)}* para o Baú Coletivo!\n📊 *Novo Saldo do Baú:* ${formatCoins(t.saldo)} / ${formatCoins(t.meta)}`);
        }

        if (sub === "abrir" || sub === "resgatar") {
            if (t.saldo < t.meta) {
                return reply(`⚠️ *Baú ainda Trancado!* O saldo atual é de *${formatCoins(t.saldo)}*, a meta de abertura é de *${formatCoins(t.meta)}*.`);
            }

            const xpData = dataService.getXpData();
            const user = xpData[sender] || dataService.initializeUser(sender);
            const premio = t.saldo;

            user.coins = (user.coins || 0) + premio;
            t.saldo = 5000; // Reset com 5k inicial

            await dataService.saveXpData(xpData);
            await dataService.saveConfigsData(configs);

            return reply(`👑 *TESOURO LIBERADO E SAQUEADO!*\n\n🎉 Parabéns @${sender.split("@")[0]}! Você abriu o Baú Coletivo e faturou a bolada de *${formatCoins(premio)}*!\n🔄 O baú foi reiniciado para uma nova rodada.`, [sender]);
        }
    }
};

