/**
 * Comando .statuscompleto / .fichadetalhada
 * Painel analítico completo com stats reais do characterEngine
 */

const { renderCard, formatNumber } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats, resolveHp } = require("../../services/characterEngine");

module.exports = {
    name: "statuscompleto",
    aliases: ["atributoscompletos", "minhaficha", "fichadetalhada"],
    category: "rpg",
    subcategory: "Personagem",
    description: "Painel analítico completo de atributos de combate e bônus",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);
        const hp = resolveHp(user);

        const card = renderCard({
            title: "FICHA ANALÍTICA DE COMBATE",
            icon: "📜",
            subtitle: `👤 *Herói:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "ATRIBUTOS PRINCIPAIS",
                    icon: "⚔️",
                    fields: [
                        { label: "Poder de Combate (CP)", value: formatNumber(stats.cp), icon: "🔥" },
                        { label: "Ataque Total", value: `${stats.atk} ATK`, icon: "🗡️" },
                        { label: "Defesa Total", value: `${stats.def} DEF`, icon: "🛡️" },
                        { label: "HP Máximo", value: `${hp.atual} / ${hp.max} ${hp.barra}`, icon: "❤️" }
                    ]
                },
                {
                    title: "COEFICIENTES ESPECIAIS",
                    icon: "📊",
                    fields: [
                        { label: "Taxa Crítica", value: `${stats.crit}%`, icon: "🎯" },
                        { label: "Dano Crítico", value: `${stats.critDmg}%`, icon: "💥" },
                        { label: "Esquiva", value: `${stats.esq}%`, icon: "💨" },
                        { label: "Bloqueio", value: `${stats.bloq}%`, icon: "🛡️" }
                    ]
                },
                {
                    title: "BÔNUS DE EQUIPAMENTO",
                    icon: "🔧",
                    fields: [
                        { label: "Nível", value: `${user.level || 1}`, icon: "📈" },
                        { label: "Forja", value: `+${user.forgeLevel || 0}`, icon: "🔨" },
                        { label: "Rebirths", value: `${user.rebirthCount || 0}`, icon: "♻️" },
                        { label: "Classe", value: `${user.classe || 'Nenhuma'}`, icon: "⚔️" }
                    ]
                }
            ],
            tip: "Evolua suas armas com `.forjar` e equipe runas para aumentar seus atributos!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};
