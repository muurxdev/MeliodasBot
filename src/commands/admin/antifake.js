/**
 * MeliodasBot — Comando .antifake
 * Bloqueia e expulsa automaticamente números estrangeiros / virtuais (+1, +44, +234, etc.)
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antifake",
    aliases: ["bloquearfake", "antivirtual", "antiddd", "fakeblock"],
    category: "admin",
    description: "Bloqueia e expulsa automaticamente números de DDI estrangeiro / virtuais",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const senderNum = sender.split("@")[0].split(":")[0];

        // PREVIEW: Simulação do evento Anti-Fake
        if (opt === "preview" || opt === "teste" || opt === "test" || opt === "ver") {
            const { renderCard } = require("../../utils/uiEngine");
            const current = Boolean(configs[from].antifake);

            const card = renderCard({
                title: "ALERTA: NÚMERO FAKE EXPULSO!",
                icon: "🚫",
                subtitle: `🛡️ *DDI Internacional Detectado:* +1 (234) 567-8900`,
                sections: [
                    {
                        title: "DETALHES DO BLOQUEIO",
                        icon: "🔒",
                        fields: [
                            { label: "Status do Módulo", value: current ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "⚙️" },
                            { label: "País / DDI", value: "EUA / Canadá (+1 - Virtual)", icon: "🌐" },
                            { label: "Medida Disciplinar", value: "⚡ *Expulsão Imediata (Kick)*", icon: "⚖️" }
                        ]
                    }
                ],
                tip: "Apenas números brasileiros (+55) são autorizados quando o Anti-Fake está on!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(opt);

        if (!isEnable && !isDisable) {
            const current = Boolean(configs[from].antifake);
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *PROTEÇÃO ANTI-FAKE* 🛡️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📌 *Status Atual:* ${current ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n\n`;
            doc += `╭━〔 ⚙️ COMO CONFIGURAR 〕━⬣\n`;
            doc += `┃ • \`.antifake on\` ➔ Expulsar números não-brasileiros (+55)\n`;
            doc += `┃ • \`.antifake off\` ➔ Permitir números internacionais\n`;
            doc += `┃ • \`.antifake preview\` ➔ Simular alerta de expulsão fake\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Protege contra bots de spam e números gerados em massa (+1, +44, +234)._\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        configs[from].antifake = isEnable;
        await dataService.saveConfigsData(configs);
        logger.info(`[ANTIFAKE] ${isEnable ? "Ativado" : "Desativado"} em ${from} por ${sender}`);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *PROTEÇÃO ANTI-FAKE* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 ⚙️ ESTADO ATUALIZADO 〕━⬣\n`;
        doc += `┃ 🛡️ *Recurso:* Bloqueio de Números Estrangeiros\n`;
        doc += `┃ ${isEnable ? "🟢" : "🔴"} *Estado:* ${isEnable ? "*ATIVADO*" : "*DESATIVADO*"}\n`;
        doc += `┃ 👤 *Administrador:* @${senderNum}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};

