/**
 * MeliodasBot — Comando .patrocinar / .patrocinio / .dropevento
 * Crie um evento patrocinado no grupo com premiação automática para o próximo que falar
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "patrocinar",
    aliases: ["patrocinio", "dropevento", "patrocinargrupo", "doarevento"],
    category: "economy",
    description: "Patrocine um evento instantâneo no grupo com moedas para os membros",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, sender, reply, args }) => {
        const valor = parseInt(args[0], 10);
        if (isNaN(valor) || valor < 500) {
            return reply("❌ Informe o valor do patrocínio (mínimo: 500 Coins).\n\n👉 *Exemplo:* `.patrocinar 1500`");
        }

        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if ((user.coins || 0) < valor) {
            return reply(`❌ *Saldo insuficiente!* Você possui *${formatCoins(user.coins || 0)}*.`);
        }

        user.coins -= valor;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "EVENTO PATROCINADO NO GRUPO!",
            icon: "🎁",
            subtitle: `👑 *Patrocinador Oficial:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "DETALHES DO PATROCÍNIO",
                    icon: "💰",
                    fields: [
                        { label: "Prêmio em Moedas", value: formatCoins(valor), icon: "🪙" },
                        { label: "Status do Evento", value: "🟢 *ATIVO (Aberto)*", icon: "📢" },
                        { label: "Como Ganhar", value: "O próximo membro que interagir no grupo leva o prêmio!", icon: "⚡" }
                    ]
                }
            ],
            tip: "Envie qualquer mensagem agora para resgatar o drop!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

