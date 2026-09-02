/**
 * MeliodasBot — Comando .racha / .dragrace / .corrida
 * Corrida de arrancada com nitro e apostas de coins
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "racha",
    aliases: ["dragrace", "corrida", "arrancada", "rachar"],
    category: "fun",
    description: "Dispute um racha de arrancada com nitro valendo moedas",
    cooldownMs: 4000,
    execute: async ({ sender, reply, args }) => {
        const aposta = parseInt(args[0], 10) || 200;
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if ((user.coins || 0) < aposta) {
            return reply(`❌ *Saldo insuficiente!* Você precisa de *${formatCoins(aposta)}* para o racha.`);
        }

        user.coins -= aposta;

        const vitoria = Math.random() > 0.45;
        const tempoSeu = (Math.random() * 2 + 7).toFixed(3);
        const tempoOp = (Math.random() * 2 + 7.2).toFixed(3);

        let premio = 0;
        if (vitoria) {
            premio = aposta * 2;
            user.coins += premio;
        }

        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "RACHA NOTURNO DE BRITÂNIA",
            icon: "🏎️",
            subtitle: `🏁 *Piloto:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DA PISTA",
                    icon: "⏱️",
                    fields: [
                        { label: "Seu Tempo", value: `${tempoSeu}s 🔥`, icon: "🏎️" },
                        { label: "Oponente", value: `${tempoOp}s 💨`, icon: "🚗" },
                        { label: "Desfecho", value: vitoria ? "🏆 *CRUZOU A LINHA EM 1º LUGAR!*" : "💥 *DERROTADO NA ARRANCADA!*", icon: "🏁" }
                    ]
                },
                {
                    title: "PREMIAÇÃO DO CIRCUITO",
                    icon: "💰",
                    fields: [
                        { label: "Aposta Feita", value: formatCoins(aposta), icon: "💳" },
                        { label: "Retorno Final", value: vitoria ? `+${formatCoins(premio)}` : "0 Coins", icon: "💎" }
                    ]
                }
            ],
            tip: "Ative o nitro no momento certo para baixar seu tempo para menos de 7 segundos!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

