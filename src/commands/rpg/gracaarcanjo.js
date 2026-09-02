const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "gracaarcanjo",
    aliases: ["gracasdivinas", "quatroarcanjos", "arcanjosgracas"],
    category: "rpg",
    description: "Consulta e bênçãos das 4 Graças Sagradas dos Arcanjos",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "AS 4 GRAÇAS SAGRADAS DOS ARCANJOS",
            icon: "✨",
            subtitle: "☀️ *Poder da Deusa Suprema*",
            sections: [
                {
                    title: "GRAÇAS DIVINAS",
                    icon: "🕊️",
                    fields: [
                        "• **Flash (Ludociel):** Velocidade da luz absoluta (+80% Esquiva)",
                        "• **Tornado (Sariel):** Barreira cortante de vento invulnerável",
                        "• **Ocean (Tarmiel):** Dimensão aquática de regeneração infinita",
                        "• **Sun (Mael / Escanor):** Poder solar devastador The One"
                    ]
                }
            ],
            tip: "Use .bencaosol para invocar a Graça do Sol!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

