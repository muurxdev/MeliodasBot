/**
 * Comando .slowmode / .modolento / .limitermensagens
 * Ativa ou desativa modo lento de envio de mensagens no grupo
 */

const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "slowmode",
    aliases: ["modolento", "limitermensagens", "slow"],
    category: "admin",
    description: "Ativa ou ajusta o modo lento no grupo para evitar spam de mensagens",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, args }) => {
        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};

        const sub = (args[0] || "").toLowerCase().trim();

        if (sub === "off" || sub === "desativar" || sub === "0") {
            configs[from].slowmode = false;
            configs[from].slowmodeSeconds = 0;
            await dataService.saveConfigsData(configs);
            return reply("🟢 *MODO LENTO DESATIVADO!* O chat está liberado sem restrição de intervalo.");
        }

        const segundos = parseInt(sub, 10) || 5;
        configs[from].slowmode = true;
        configs[from].slowmodeSeconds = segundos;
        await dataService.saveConfigsData(configs);

        const card = renderCard({
            title: "MODO LENTO (SLOWMODE) ATIVADO",
            icon: "⏳",
            subtitle: `🛡️ *Administrador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "PARÂMETROS DA SALA",
                    icon: "⚙️",
                    fields: [
                        { label: "Status", value: "🟢 *ATIVADO*", icon: "📢" },
                        { label: "Intervalo entre Mensagens", value: `${segundos} segundos por membro`, icon: "⏱️" },
                        { label: "Exceção", value: "Administradores não são afetados", icon: "👑" }
                    ]
                }
            ],
            tip: "Digite .slowmode off para desativar o modo lento a qualquer momento!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};
