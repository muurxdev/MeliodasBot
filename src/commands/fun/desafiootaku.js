const { renderCard, formatXP, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "desafiootaku",
    aliases: ["quizexpert", "desafioanimepro", "otakuexpert"],
    category: "fun",
    description: "Desafio de quiz otaku avançado para veteranos de animes",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const resp = (args[0] || "").toUpperCase().trim();
        if (!resp) {
            const card = renderCard({
                title: "DESAFIO OTAKU EXPERT",
                icon: "⛩️",
                subtitle: "🧠 *Nível: Mestre dos Animes*",
                sections: [
                    {
                        title: "PERGUNTA DO DESAFIO",
                        icon: "❓",
                        fields: [
                            "📜 Qual o nome do clã original de Meliodas antes de liderar os 7 Pecados?",
                            "A) Clã das Deusas",
                            "B) Clã dos Demônios (10 Mandamentos)",
                            "C) Cavaleiros Sagrados",
                            "D) Clã dos Druidas"
                        ]
                    }
                ],
                tip: "Responda com .desafiootaku B!",
                mentions: [sender]
            });
            return reply(card, [sender]);
        }

        if (resp === "B") {
            const xpData = dataService.getXpData();
            const user = xpData[sender] || dataService.initializeUser(sender);
            user.xp = (user.xp || 0) + 500;
            user.coins = (user.coins || 0) + 800;
            await dataService.saveXpData(xpData);

            return reply("🎉 *RESPOSTA CORRETA!* Letra B!\nMeliodas era o temido líder dos 10 Mandamentos!\n🏆 +" + formatXP(500) + " & +" + formatCoins(800) + "!");
        } else {
            return reply("❌ *RESPOSTA INCORRETA!* A resposta correta era a Letra B (Clã dos Demônios).");
        }
    }
};

