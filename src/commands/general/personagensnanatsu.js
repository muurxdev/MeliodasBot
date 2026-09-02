const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "personagensnanatsu",
    aliases: ["nanatsupersonagens", "listapersonagensanime", "elencosins"],
    category: "general",
    description: "Catálogo completo de personagens e clãs de Nanatsu no Taizai",
    cooldownMs: 2000,
    execute: async ({ sender, reply }) => {
        const card = renderCard({
            title: "PERSONAGENS DE NANATSU NO TAIZAI",
            icon: "⛩️",
            subtitle: "📖 *Guia de Personagens & Clãs*",
            sections: [
                {
                    title: "OS SETE PECADOS CAPITAIS",
                    icon: "🐉",
                    fields: [
                        "• **Meliodas:** Dragão da Ira (Capitão)",
                        "• **Ban:** Raposa da Ganância (O Imortal)",
                        "• **King (Harlequin):** Urso da Preguiça (Rei Fada)",
                        "• **Diane:** Serpente da Inveja (Guerreira Gigante)",
                        "• **Gowther:** Cabra da Luxúria (Boneco Mágico)",
                        "• **Merlin:** Javali da Gula (A Maior Maga de Britânia)",
                        "• **Escanor:** Leão do Orgulho (The One)"
                    ]
                }
            ],
            tip: "Use .pecadocapital para escolher sua afinidade!",
            mentions: [sender]
        });
        return reply(card, [sender]);
    }
};

