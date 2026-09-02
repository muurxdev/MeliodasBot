const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

const PECADOS = {
    ira: { nome: "Ira do Dragão (Meliodas)", bonus: "Dano Físico +35% / Contra-Ataque Total", icone: "🐉" },
    ganancia: { nome: "Ganância da Raposa (Ban)", bonus: "Roubo de Vida +25% / Imortalidade Parcial", icone: "🦊" },
    preguica: { nome: "Preguiça do Urso (King)", bonus: "Dano Mágico +30% / Lança Chastiefol", icone: "🐻" },
    inveja: { nome: "Inveja da Serpente (Diane)", bonus: "Defesa Absoluta +40% / Heavy Metal", icone: "🐍" },
    luxuria: { nome: "Luxúria da Cabra (Gowther)", bonus: "Controle Mental / Invasão Ilusória", icone: "🐐" },
    gula: { nome: "Gula do Javali (Merlin)", bonus: "Poder Mágico Infinito / Cancelar Magias", icone: "🐗" },
    orgulho: { nome: "Orgulho do Leão (Escanor)", bonus: "Poder Solar Absoluto / The One", icone: "🦁" }
};

module.exports = {
    name: "pecadocapital",
    aliases: ["pecado", "setepecados", "afinidadepecado", "meupecado"],
    category: "rpg",
    description: "Escolha sua afinidade mágica com um dos 7 Pecados Capitais",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};

        const sub = (args[0] || "").toLowerCase().trim();
        if (!sub || !PECADOS[sub]) {
            const fields = Object.entries(PECADOS).map(([k, info]) => info.icone + " *" + info.nome + "*\n   └ 💥 " + info.bonus + " (`.pecadocapital " + k + "`)");
            const card = renderCard({
                title: "AFINIDADE DOS 7 PECADOS CAPITAIS",
                icon: "🐉",
                subtitle: "👤 *Guerreiro:* @" + sender.split("@")[0],
                sections: [
                    { title: "SEU PECADO ATIVO", icon: "✨", fields: [user.rpg.pecado ? "• " + (PECADOS[user.rpg.pecado]?.icone || "🔹") + " *" + (PECADOS[user.rpg.pecado]?.nome || user.rpg.pecado) + "*" : "_Nenhum pecado vinculado._"] },
                    { title: "PECADOS DISPONÍVEIS", icon: "📜", fields }
                ],
                tip: "Digite .pecadocapital <ira|ganancia|preguica|inveja|luxuria|gula|orgulho> para escolher!",
                mentions: [sender]
            });
            return reply(card, [sender]);
        }

        user.rpg.pecado = sub;
        await dataService.saveXpData(xpData);
        return reply("🎉 *AFINIDADE DESPERTADA!*\n\n" + PECADOS[sub].icone + " Você agora carrega a marca do *" + PECADOS[sub].nome + "*!\n💥 *Poder:* " + PECADOS[sub].bonus);
    }
};