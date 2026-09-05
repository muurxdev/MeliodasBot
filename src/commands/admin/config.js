/**
 * Comando .config / .configuracoes / .painelconfig
 * Painel Central de Configurações do Grupo e Personalização de Menus/Wallpapers
 */

const dataService = require("../../services/dataService");
const { renderCard } = require("../../utils/uiEngine");
const { getAllMenuMediaStatus } = require("../../utils/wallpapers");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "config",
    aliases: ["configurar", "configuracoes", "configs", "painelconfig"],
    category: "admin",
    description: "Painel de controle central de configurações do grupo e personalização de wallpapers",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, client, info, isAdmin, isOwner, userRole }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        const groupConfig = configs[from] || {};

        const sub = (args[0] || "").toLowerCase().trim();
        const opt = (args[1] || "").toLowerCase().trim();

        // 1. ATALHO: CONFIGURAÇÃO DE WALLPAPERS / VÍDEOS ANIMADOS
        if (sub === "wallpaper" || sub === "wallpapers" || sub === "video" || sub === "midia") {
            const list = getAllMenuMediaStatus();
            let wpFields = [];

            list.slice(0, 10).forEach(m => {
                wpFields.push(`• *${m.label}:* ${m.status}`);
            });

            const doc = renderCard({
                title: "CONFIGURAÇÃO DE WALLPAPERS",
                icon: "🎬",
                subtitle: `🎨 *Personalize os Live Wallpapers (Vídeos Animados) dos Menus*`,
                sections: [
                    {
                        title: "ESTADO DOS WALLPAPERS ANIMADOS",
                        icon: "📊",
                        fields: wpFields
                    },
                    {
                        title: "COMO ALTERAR OU RESTAURAR",
                        icon: "⚙️",
                        fields: [
                            "👉 `.setwallpaper <categoria>` ➔ Responda a um vídeo ou foto com o comando",
                            "👉 `.setwallpaper reset <categoria>` ➔ Restaura o live wallpaper oficial do anime",
                            "👉 `.setwallpaper list` ➔ Lista detalhada de todos os menus disponíveis"
                        ]
                    }
                ],
                tip: "Live wallpapers em vídeo MP4 são exibidos automaticamente com gifPlayback em alta qualidade!",
                mentions: [sender]
            });

            return reply(doc, [sender]);
        }

        // 2. PAINEL GERAL DE STATUS DO GRUPO
        const isAntilink = Boolean(groupConfig.antilink);
        const isWelcome = groupConfig.welcome === true || groupConfig.welcomeEnabled === true;
        const isLeave = groupConfig.leave === true || groupConfig.leaveEnabled === true;
        const isAntifake = Boolean(groupConfig.antifake);
        const isRestricted = Boolean(groupConfig.restrictedToAdmins);
        const prefix = groupConfig.prefix || ".";

        const doc = renderCard({
            title: "PAINEL DE CONFIGURAÇÕES DO GRUPO",
            icon: "⚙️",
            subtitle: `🛡️ *Administrador:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "STATUS DOS MÓDULOS DE SEGURANÇA",
                    icon: "🔒",
                    fields: [
                        { label: "Anti-Link de Grupos", value: isAntilink ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "🔗" },
                        { label: "Anti-Fake (+1, +44, +234)", value: isAntifake ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "🌍" },
                        { label: "Modo Restrito (Apenas Admins)", value: isRestricted ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "🛡️" },
                        { label: "Prefixo do Grupo", value: `\`${prefix}\``, icon: "⌨️" }
                    ]
                },
                {
                    title: "EVENTOS AUTOMÁTICOS",
                    icon: "🎉",
                    fields: [
                        { label: "Boas-Vindas (Welcome)", value: isWelcome ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "👋" },
                        { label: "Despedida (Leave)", value: isLeave ? "🟢 *ATIVADO*" : "🔴 *DESATIVADO*", icon: "🚪" }
                    ]
                },
                {
                    title: "COMANDOS RÁPIDOS DE ALTERAÇÃO",
                    icon: "📝",
                    fields: [
                        "• `.welcome <on|off|preview|msg>` ➔ Controle de boas-vindas",
                        "• `.leave <on|off|preview|msg>` ➔ Controle de despedida",
                        "• `.antilink <on|off>` ➔ Proteção contra links externos",
                        "• `.antifake <on|off>` ➔ Proteção contra números virtuais",
                        "• `.setwallpaper <cat>` ➔ Personalizar vídeos dos menus",
                        "• `.config wallpaper` ➔ Painel de wallpapers e mídia"
                    ]
                }
            ],
            tip: "Use os comandos rápidos acima para alterar as preferências do grupo em tempo real!",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};

