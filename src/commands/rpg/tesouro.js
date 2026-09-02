/**
 * MeliodasBot — Comando .tesouro / .tesourosagrado
 * Enciclopédia e Despertar dos 7 Tesouros Sagrados dos Sete Pecados Capitais
 */

const { getBotName } = require("../../config/botConfig");

const SACRED_TREASURES = [
    { nome: "🗡️ Espada Demoníaca Lostvayne", dono: "Meliodas (Pecado da Ira)", poder: "Cria clones físicos com dano multiplicado e reflete magias com Full Counter." },
    { nome: "🔨 Martelo Sagrado Gideon", dono: "Diane (Pecado da Inveja)", poder: "Manipula as placas tectônicas e absorve o impacto de magias na terra." },
    { nome: "🔱 Lança Espiritual Chastiefol", dono: "King (Pecado da Preguiça)", poder: "Possui 8 formas divinas da Árvore Sagrada (Guardião, Pólen, Girassol, Multi-Lâminas)." },
    { nome: "🏹 Arco Duplo Herritt", dono: "Gowther (Pecado da Luxúria)", poder: "Dispara flechas de luz mágica que reescrevem memórias e afetam o sistema nervoso." },
    { nome: "🔮 Estrela da Manhã Aldan", dono: "Merlin (Pecado da Gula)", poder: "Orbe mágica que armazena feitiços infinitos e amplia poder de teletransporte." },
    { nome: "🪓 Machado Divino Rhitta", dono: "Escanor (Pecado do Orgulho)", poder: "Armazena a radiação e calor solar de Escanor, liberando com a técnica Sol Cruel." },
    { nome: "🥢 Bastão Sagrado Courechouse", dono: "Ban (Pecado da Ganância)", poder: "Amplia o alcance do Roubo Físico (Snatch), sugando atributos dos inimigos." }
];

module.exports = {
    name: "tesouro",
    aliases: ["tesouros", "tesourosagrado", "sacredtreasure", "armassagradas"],
    category: "rpg",
    description: "Exibe os 7 Tesouros Sagrados dos Sete Pecados Capitais e seus poderes",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();

        let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        doc += `┃   👑 *OS 7 TESOUROS SAGRADOS DE BRITANNIA* 👑   \n`;
        doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        doc += `✨ *Armas forjadas pelo Rei Demônio e Rei das Fadas para liberar o potencial máximo dos Pecados Capitais.*\n\n`;

        SACRED_TREASURES.forEach((t) => {
            doc += `╭━━━〔 ${t.nome} 〕━━━┈⊷\n`;
            doc += `┃ 👤 *Portador Original:* ${t.dono}\n`;
            doc += `┃ 📜 *Habilidade Oculta:* _${t.poder}_\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        });

        doc += `💡 _Para liberar o poder de Meliodas, digite \`.lostvayne\` ou veja seus equipamentos com \`.inv\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
