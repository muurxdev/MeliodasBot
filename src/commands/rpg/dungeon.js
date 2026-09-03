/**
 * Comando .dungeon / .masmorra
 * Desafio de Masmorra em andares progressivos (1 a 10) com hordas de monstros, bosses e drops raros
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

const DUNGEON_FLOORS = [
    { andar: 1, nome: "Cripta dos Mortos-Vivos", minLevel: 1, reqCp: 80, xp: 450, coins: 350, drop: "🦴 Crânio Amaldiçoado" },
    { andar: 2, nome: "Caverna dos Goblins Vorazes", minLevel: 5, reqCp: 250, xp: 950, coins: 700, drop: "🗡️ Adaga de Ferro Goblin" },
    { andar: 3, nome: "Labirinto das Sombras Antigas", minLevel: 12, reqCp: 600, xp: 1800, coins: 1400, drop: "🌑 Fragmento de Sombra" },
    { andar: 4, nome: "Torre dos Cavaleiros Sagrados", minLevel: 20, reqCp: 1200, xp: 3500, coins: 2800, drop: "🛡️ Brasão de Ferro Real" },
    { andar: 5, nome: "Caverna do Dragão Carmesim", minLevel: 30, reqCp: 2500, xp: 7000, coins: 5500, drop: "🔥 Escama de Dragão Ancestral" },
    { andar: 6, nome: "Abismo do Purgatório Demoníaco", minLevel: 45, reqCp: 5000, xp: 14000, coins: 10000, drop: "🩸 Sangue Demoníaco Puro" },
    { andar: 7, nome: "Santuário dos Arcanjos Decaídos", minLevel: 60, reqCp: 9000, xp: 25000, coins: 18000, drop: "🪽 Pluma Celestial Sagrada" },
    { andar: 8, nome: "Templo do Rei Demônio", minLevel: 75, reqCp: 15000, xp: 45000, coins: 35000, drop: "👑 Coroa do Soberano Sombrio" },
    { andar: 9, nome: "Palácio da Divindade Suprema", minLevel: 90, reqCp: 25000, xp: 80000, coins: 65000, drop: "✨ Orbe da Graça Imortal" },
    { andar: 10, nome: "Vórtice do Caos Primordial", minLevel: 100, reqCp: 40000, xp: 150000, coins: 120000, drop: "🌌 Centelha do Caos Infinito" }
];

module.exports = {
    name: "dungeon",
    aliases: ["masmorra", "torredesafio", "catacumbas", "andares", "explorarmasmorra"],
    category: "rpg",
    description: "Explore os andares da Masmorra de Britannia contra hordas de monstros e chefes",
    cooldownMs: 8000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. LISTA DE ANDARES / INFO
        if (sub === "lista" || sub === "andares" || sub === "info") {
            let doc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            doc += `┃   🏰 *MASMORRA DE BRITANNIA — ANDARES* 🏰   \n`;
            doc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            doc += `👤 *Guerreiro:* @${sender.split("@")[0]}  |  ⚡ *CP:* ${stats.cp} CP\n\n`;

            doc += `╭━━━〔 🏛️ ANDARES DA MASMORRA 〕━━━┈⊷\n`;
            DUNGEON_FLOORS.forEach(f => {
                const canEnter = (user.level || 1) >= f.minLevel;
                const icon = canEnter ? "🟢" : "🔒";
                doc += `┃ ${icon} *Andar ${f.andar}:* ${f.nome}\n`;
                doc += `┃    📌 Requer Nível ${f.minLevel} (${f.reqCp} CP) | 💰 +${f.coins.toLocaleString("pt-BR")} Coins | ⭐ +${f.xp.toLocaleString("pt-BR")} XP\n`;
                doc += `┃    🎁 Drop: ${f.drop}\n┃\n`;
            });
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
            doc += `💡 _Para explorar o andar mais avançado liberado para você:_ \`.dungeon\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // 2. ENTRAR NO ANDAR MAIS ALTO DISPONÍVEL
        const availableFloors = DUNGEON_FLOORS.filter(f => (user.level || 1) >= f.minLevel);
        const currentFloor = availableFloors[availableFloors.length - 1] || DUNGEON_FLOORS[0];

        // Cálculo balanceado de vitória
        const winProbability = Math.min(95, Math.max(30, Math.floor((stats.cp / currentFloor.reqCp) * 65)));
        const roll = Math.floor(Math.random() * 100) + 1;
        const won = roll <= winProbability;

        if (!won) {
            const hpLoss = Math.floor(stats.hpMax * 0.35);
            user.hp = Math.max(1, (user.hp || stats.hpMax) - hpLoss);
            await dataService.saveXpData(xpData);

            let failDoc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
            failDoc += `┃   ☠️ *DERROTADO NA MASMORRA!* ☠️   \n`;
            failDoc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
            failDoc += `🏰 *Andar:* Andar ${currentFloor.andar} — ${currentFloor.nome}\n`;
            failDoc += `💥 *Resultado:* Você foi encurralado pelos monstros do calabouço!\n`;
            failDoc += `💔 *Dano Sofrido:* -${hpLoss} HP (Seu HP: ${user.hp}/${stats.hpMax})\n\n`;
            failDoc += `💡 _Aprimore suas armas no ferreiro (\`.forjar\`) e recupere a vida com \`.curar-max\` antes de tentar novamente._\n`;
            failDoc += `👑 *${botName}*`;
            return reply(failDoc.trim(), [sender]);
        }

        // VITÓRIA NO ANDAR
        user.xp = (user.xp || 0) + currentFloor.xp;
        user.coins = (user.coins || 0) + currentFloor.coins;

        if (!Array.isArray(user.inventario)) user.inventario = [];
        const limiteMochila = user.mochila || 20;
        let dropGanho = false;
        if (user.inventario.length < limiteMochila) {
            user.inventario.push(currentFloor.drop);
            dropGanho = true;
        }

        await dataService.saveXpData(xpData);

        let winDoc = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`;
        winDoc += `┃   🏆 *ANDAR DA MASMORRA CONQUISTADO!* 🏆   \n`;
        winDoc += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
        winDoc += `🏰 *Andar:* **Andar ${currentFloor.andar} — ${currentFloor.nome}**\n`;
        winDoc += `👤 *Guerreiro:* @${sender.split("@")[0]}\n\n`;

        winDoc += `╭━━━〔 🎁 RECOMPENSAS DO CALABOUÇO 〕━━━┈⊷\n`;
        winDoc += `┃ ⭐ *XP Ganho:* +${currentFloor.xp.toLocaleString("pt-BR")} XP\n`;
        winDoc += `┃ 💰 *Coins Coletados:* +${currentFloor.coins.toLocaleString("pt-BR")} Coins\n`;
        if (dropGanho) {
            winDoc += `┃ 🎁 *Drop Adquirido:* ${currentFloor.drop}\n`;
        } else {
            winDoc += `┃ ⚠️ *Mochila Cheia:* Drop não pôde ser guardado. Aumente com \`.mochila up\`!\n`;
        }
        winDoc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷\n\n`;
        winDoc += `👑 *${botName}*`;

        return reply(winDoc.trim(), [sender]);
    }
};
