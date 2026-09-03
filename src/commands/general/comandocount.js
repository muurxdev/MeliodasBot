/**
 * Comando .comandocount / .totalcomandos / .cmdcount
 * Exibe a contagem exata e dinâmica de todos os comandos e aliases carregados no bot
 */

const { renderCard, formatNumber } = require("../../utils/uiEngine");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "comandocount",
    aliases: ["totalcomandos", "cmdcount", "qtdcomandos", "quantoscomandos", "contagemcomandos"],
    category: "general",
    description: "Exibe a contagem oficial e exata de todos os comandos e aliases do bot",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const dispatcher = require("../../handlers/commandDispatcher");
        const totalCmds = dispatcher.commands.size;
        const totalAliases = dispatcher.aliases.size;

        const cats = {};
        for (const [_, cmd] of dispatcher.commands) {
            const cat = (cmd.category || "outros").toUpperCase();
            cats[cat] = (cats[cat] || 0) + 1;
        }

        const catFields = Object.entries(cats).map(([c, count]) => `• *${c}:* ${count} Comandos`);

        const card = renderCard({
            title: "CATÁLOGO OFICIAL DE COMANDOS",
            icon: "⚡",
            subtitle: `🤖 *${getBotName()} v2.0 — Sistema Modular*`,
            sections: [
                {
                    title: "MÉTRICAS GERAIS",
                    icon: "📊",
                    fields: [
                        { label: "Comandos Canônicos", value: `🏆 *${totalCmds} Comandos Únicos*`, icon: "📜" },
                        { label: "Atalhos & Aliases", value: `⚡ *${totalAliases} Aliases Registrados*`, icon: "🏷️" },
                        { label: "Total de Gatilhos", value: `🌟 *${totalCmds + totalAliases} Formas de Execução*`, icon: "🔥" }
                    ]
                },
                {
                    title: "DISTRIBUIÇÃO POR CATEGORIA",
                    icon: "📂",
                    fields: catFields
                }
            ],
            tip: "Digite .menu all para navegar por todos os comandos catalogados!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

