/**
 * MeliodasBot — Comando .lotofacil / .loto / .loteria-rapida
 * Loteria rápida de 5 números com sorteio instantâneo e multiplicadores altos
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "lotofacil",
    aliases: ["loto", "loteria-rapida", "lotofacil-aposta"],
    category: "economy",
    description: "Aposte em 3 a 5 números na LotoFácil de Britânia e ganhe até 50x o valor apostado",
    cooldownMs: 4000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        const aposta = parseInt(args[0], 10);
        if (isNaN(aposta) || aposta < 100) {
            return reply("❌ Informe o valor da aposta (mínimo: 100 Coins) e seus 3 números escolhidos de 1 a 10.\n\n👉 *Exemplo:* `.lotofacil 500 2 5 9`");
        }

        const numerosEscolhidos = args.slice(1, 4).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 10);
        if (numerosEscolhidos.length < 3) {
            return reply("❌ Escolha exatamente 3 números diferentes entre 1 e 10.\n\n👉 *Exemplo:* `.lotofacil 500 3 7 10`");
        }

        if ((user.coins || 0) < aposta) {
            return reply(`❌ *Saldo insuficiente!* Você tem apenas *${formatCoins(user.coins || 0)}*.`);
        }

        user.coins -= aposta;

        // Sortear 4 números vencedores de 1 a 10
        const sorteados = [];
        while (sorteados.length < 4) {
            const rand = Math.floor(Math.random() * 10) + 1;
            if (!sorteados.includes(rand)) sorteados.push(rand);
        }

        // Verificar acertos
        const acertos = numerosEscolhidos.filter(n => sorteados.includes(n));
        let premio = 0;
        let multiplicador = 0;

        if (acertos.length === 3) {
            multiplicador = 15; // 15x
            premio = aposta * multiplicador;
        } else if (acertos.length === 2) {
            multiplicador = 3; // 3x
            premio = aposta * multiplicador;
        } else if (acertos.length === 1) {
            multiplicador = 1; // Devolve
            premio = aposta * multiplicador;
        }

        if (premio > 0) {
            user.coins += premio;
        }

        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "LOTOFÁCIL DE BRITÂNIA — SORTEIO",
            icon: "🎟️",
            subtitle: `👤 *Apostador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "RESULTADO DO SORTEIO",
                    icon: "🎰",
                    fields: [
                        { label: "Seus Números", value: `[ ${numerosEscolhidos.join(" - ")} ]`, icon: "🎯" },
                        { label: "Números Sorteados", value: `[ ${sorteados.join(" - ")} ]`, icon: "🎲" },
                        { label: "Total de Acertos", value: `${acertos.length} Acerto(s) (${acertos.length > 0 ? acertos.join(", ") : "Nenhum"})`, icon: "✨" }
                    ]
                },
                {
                    title: "BALANÇO FINANCEIRO",
                    icon: "💰",
                    fields: [
                        { label: "Aposta Realizada", value: formatCoins(aposta), icon: "💳" },
                        { label: "Multiplicador", value: multiplicador > 0 ? `${multiplicador}x` : "0x (Derrota)", icon: "📈" },
                        { label: "Premiação Final", value: premio > 0 ? `🎉 *+${formatCoins(premio)}*` : "❌ *Perdeu a aposta*", icon: "🏆" }
                    ]
                }
            ],
            tip: "Acerte os 3 números para faturar 15x o valor apostado!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

