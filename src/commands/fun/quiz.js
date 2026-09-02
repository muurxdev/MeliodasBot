/**
 * MeliodasBot — Comando .quiz
 * Quiz interativo de perguntas e respostas com prêmios de XP e Moedas
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");

const activeQuizzes = new Map();

const QUESTIONS = [
    { q: "Qual é o Tesouro Sagrado de Meliodas?", a: "LOSTVAYNE", opts: ["Rhitta", "Lostvayne", "Chastiefol", "Gideon"] },
    { q: "Qual o nome da espada empunhada por Arthur Pendragon?", a: "EXCALIBUR", opts: ["Dragon Handle", "Excalibur", "Muramasa", "Courechouse"] },
    { q: "Qual o Pecado Capital de Escanor?", a: "ORGULHO", opts: ["Ira", "Ganância", "Orgulho", "Gula"] },
    { q: "Qual o nome do bar móvel de Meliodas?", a: "CHAPEU DE JAVALI", opts: ["Javali Dourado", "Chapéu de Javali", "Taberna Real", "Pecados Bar"] },
    { q: "Qual o mandamento de Zeldris?", a: "PIEDADE", opts: ["Verdade", "Piedade", "Amor", "Pureza"] }
];

module.exports = {
    name: "quiz",
    aliases: ["trivia", "pergunta", "jogodeperguntas"],
    category: "fun",
    description: "Participe de um quiz de animes e conhecimentos para ganhar XP e moedas",
    execute: async ({ from, args, sender, reply }) => {
        let current = activeQuizzes.get(from);
        const input = (args && args.join(" ")) ? args.join(" ").toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

        if (current && input) {
            if (input === current.a || (current.opts && current.opts.some(o => o.toUpperCase() === input && o.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === current.a))) {
                activeQuizzes.delete(from);
                const xpData = dataService.getXpData();
                const user = initializeUser(sender, xpData);
                user.xp = (user.xp || 0) + 300;
                user.coins = (user.coins || 0) + 200;
                dataService.saveUser(user);

                return reply(`🎉 *RESPOSTA CORRETA! Parabéns!*\n\n👑 Resposta: *${current.a}*\n⭐ *Recompensa:* +300 XP e +200 Coins!\n💡 _Envie \`.quiz\` para a próxima pergunta!_`);
            } else {
                return reply(`❌ *Resposta incorreta!* Tente novamente respondendo com \`.quiz <resposta>\`.`);
            }
        }

        const picked = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
        activeQuizzes.set(from, picked);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║       🧠 *QUIZ MELIODAS* 🧠     ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `❓ *Pergunta:* ${picked.q}\n\n`;
        doc += `╭━〔 📋 OPÇÕES 〕━⬣\n`;
        picked.opts.forEach((o, i) => {
            doc += `┃ ${i + 1}. ${o}\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👉 _Responda enviando \`.quiz <opção>\`_`;

        return reply(doc.trim());
    }
};

