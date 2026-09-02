/**
 * MeliodasBot — Comando .antilink Avançado & Granular por Plataforma
 * Suporte a bloqueio geral ou seletivo: whatsapp, canal, telegram, instagram, tiktok, discord, youtube
 * Ações configuráveis: ban, kick, warn, delete
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

module.exports = {
    name: "antilink",
    aliases: ["bloquearlinks", "linkblock", "antigrupos", "antilinks"],
    category: "admin",
    description: "Configura proteção anti-link avançada com filtros por plataforma (telegram, whatsapp, instagram, etc.)",
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        if (!configs[from].antilinkConfig) {
            configs[from].antilinkConfig = {
                enabled: Boolean(configs[from].antilink),
                action: "delete", // delete, warn, kick, ban
                platforms: {
                    whatsapp: true,
                    canal: true,
                    telegram: true,
                    instagram: false,
                    tiktok: false,
                    discord: true,
                    youtube: false,
                    outros: false
                }
            };
        }

        const sub = (args[0] || "").toLowerCase().trim();
        const param = (args[1] || "").toLowerCase().trim();

        // 0. PREVIEW: Simular alerta de anti-link
        if (sub === "preview" || sub === "teste" || sub === "test" || sub === "ver") {
            const { renderCard } = require("../../utils/uiEngine");
            const senderNum = sender.split("@")[0].split(":")[0];
            const cfg = configs[from].antilinkConfig;

            const card = renderCard({
                title: "ALERTA: LINK INTERCEPTADO!",
                icon: "🚫",
                subtitle: `🛡️ *Infrator Simulado:* @${senderNum}`,
                sections: [
                    {
                        title: "DETALHES DA INFRAÇÃO",
                        icon: "🔗",
                        fields: [
                            { label: "Link Detectado", value: "https://chat.whatsapp.com/ExemploConvite123", icon: "🌐" },
                            { label: "Ação Aplicada", value: `⚡ *${cfg.action.toUpperCase()}*`, icon: "⚖️" },
                            { label: "Regra Violada", value: "Proibido envio de links não autorizados", icon: "📜" }
                        ]
                    }
                ],
                tip: "Links de convites, canais e sites externos são monitorados 24/7!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        // 1. Toggle Geral
        if (sub === "on" || sub === "ativar" || sub === "1") {
            configs[from].antilink = true;
            configs[from].antilinkConfig.enabled = true;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *ANTI-LINK ATIVADO!* Links suspeitos serão filtrados no grupo.\nAção configurada: *${configs[from].antilinkConfig.action.toUpperCase()}*`);
        }
        if (sub === "off" || sub === "desativar" || sub === "0") {
            configs[from].antilink = false;
            configs[from].antilinkConfig.enabled = false;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *ANTI-LINK DESATIVADO!* Envio de links liberado.`);
        }

        // 2. Configurar Ação (.antilink acao <delete|warn|kick|ban>)
        if (sub === "acao" || sub === "action" || sub === "punicao") {
            if (["delete", "apagar", "warn", "advertir", "kick", "expulsar", "ban", "banir"].includes(param)) {
                let normalized = "delete";
                if (param.startsWith("ban")) normalized = "ban";
                else if (param.startsWith("kick") || param.startsWith("exp")) normalized = "kick";
                else if (param.startsWith("warn") || param.startsWith("adv")) normalized = "warn";

                configs[from].antilinkConfig.action = normalized;
                await dataService.saveConfigsData(configs);
                return reply(`⚙️ *Ação do Anti-Link definida como:* *${normalized.toUpperCase()}*`);
            }
            return reply("❌ *Ações disponíveis:* `delete` (apenas apagar), `warn` (advertir), `kick` (expulsar) ou `ban` (banir).");
        }

        // 3. Configurar Plataformas Individuais (.antilink telegram on/off, etc.)
        const validPlatforms = ["whatsapp", "canal", "telegram", "instagram", "tiktok", "discord", "youtube", "outros"];
        if (validPlatforms.includes(sub)) {
            const isEnable = ["on", "1", "ativar", "sim"].includes(param);
            const isDisable = ["off", "0", "desativar", "nao"].includes(param);
            if (isEnable || isDisable) {
                configs[from].antilinkConfig.platforms[sub] = isEnable;
                await dataService.saveConfigsData(configs);
                return reply(`⚙️ *Filtro para [${sub.toUpperCase()}]:* ${isEnable ? "🟢 *ATIVADO (Bloquear)*" : "🔴 *DESATIVADO (Permitir)*"}`);
            }
        }

        // Painel de Status
        const cfg = configs[from].antilinkConfig;
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🛡️ *PAINEL ANTI-LINK AVANÇADO* 🛡️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Status Geral:* ${cfg.enabled ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*"}\n`;
        doc += `⚖️ *Punição Definida:* \`${cfg.action.toUpperCase()}\`\n\n`;
        doc += `╭━〔 🌐 FILTROS POR PLATAFORMA 〕━⬣\n`;
        for (const [plat, enabled] of Object.entries(cfg.platforms)) {
            doc += `┃ ${enabled ? "🟢" : "🔴"} *${plat.toUpperCase()}:* ${enabled ? "Bloqueado" : "Permitido"}\n`;
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 *Comandos de Configuração:*\n`;
        doc += `• \`.antilink on/off\` — Ligar/Desligar geral\n`;
        doc += `• \`.antilink acao <delete|warn|kick|ban>\` — Definir punição\n`;
        doc += `• \`.antilink <plataforma> on/off\` — Alternar plataforma específica (ex: \`.antilink telegram on\`)\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
