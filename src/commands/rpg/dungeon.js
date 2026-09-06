/**
 * Comando .dungeon / .masmorra
 * Desafio de Masmorra em andares progressivos (1 a 10) com hordas de monstros, bosses e drops raros
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");

const BASE_DUNGEON_FLOORS = [
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

const PROCEDURAL_TITLES = [
    "Dimensão dos Deuses Esquecidos",
    "Fenda do Vazio Cósmico",
    "Torre da Ascensão Astral",
    "Reino das Trevas Eternas",
    "Trono do Infinito",
    "Fronteira da Realidade",
    "Câmara do Tempo Perdido",
    "Abismo dos Titãs Primordiais"
];

function getFloorData(floorNum) {
    if (floorNum <= 10) {
        return BASE_DUNGEON_FLOORS[Math.max(0, floorNum - 1)];
    }
    const diff = floorNum - 10;
    const minLevel = 100 + (diff * 10);
    const reqCp = Math.floor(40000 * Math.pow(1.18, diff));
    const xp = Math.floor(150000 * Math.pow(1.20, diff));
    const coins = Math.floor(120000 * Math.pow(1.18, diff));
    const title = PROCEDURAL_TITLES[(diff - 1) % PROCEDURAL_TITLES.length] + ` (Setor ${Math.ceil(diff / PROCEDURAL_TITLES.length)})`;
    return {
        andar: floorNum,
        nome: title,
        minLevel,
        reqCp,
        xp,
        coins,
        drop: `💎 Cristal Astral (Andar ${floorNum})`
    };
}

module.exports = {
    name: "dungeon",
    aliases: ["masmorra", "torredesafio", "catacumbas", "andares", "explorarmasmorra"],
    category: "rpg",
    description: "Explore os andares infinitos da Masmorra de Britannia contra hordas de monstros e chefes",
    cooldownMs: 8000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);
        const userLevel = Number(user.level || 1);

        // Inicializa andar da masmorra do usuário
        const defaultUnlockedFloor = userLevel <= 100
            ? (BASE_DUNGEON_FLOORS.filter(f => userLevel >= f.minLevel).pop()?.andar || 1)
            : (10 + Math.floor((userLevel - 100) / 10));
        user.dungeonFloor = Math.max(1, Number(user.dungeonFloor || defaultUnlockedFloor));

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. LISTA DE ANDARES / INFO
        if (sub === "lista" || sub === "andares" || sub === "info") {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏰 *MASMORRA DE BRITANNIA — ANDARES* 🏰   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👤 *Guerreiro:* @${sender.split("@")[0]}  |  ⚡ *CP:* ${stats.cp.toLocaleString("pt-BR")} CP\n`;
            doc += `🚪 *Seu Andar Mais Alto Liberado:* **Andar ${user.dungeonFloor}**\n\n`;

            doc += `╭━〔 🏛️ ANDARES DA MASMORRA (INFINITOS) 〕━⬣\n`;
            BASE_DUNGEON_FLOORS.forEach(f => {
                const canEnter = f.andar <= user.dungeonFloor || userLevel >= f.minLevel;
                const isBoss = (f.andar % 5 === 0);
                const icon = canEnter ? (isBoss ? "👑" : "🟢") : "🔒";
                const bossTag = isBoss ? " 🐲 *(CHEFE)*" : "";
                doc += `┃ ${icon} *Andar ${f.andar}:* ${f.nome}${bossTag}\n`;
                doc += `┃    📌 Requer Nível ${f.minLevel} (${f.reqCp.toLocaleString("pt-BR")} CP) | 💰 +${f.coins.toLocaleString("pt-BR")} Coins | ⭐ +${f.xp.toLocaleString("pt-BR")} XP\n`;
                doc += `┃    🎁 Drop: ${f.drop}\n┃\n`;
            });

            // Se o usuário já passou do nível 100 ou andar 10, exibe os andares procedurais liberados
            const maxProcedural = Math.max(user.dungeonFloor, 10 + Math.floor((Math.max(100, userLevel) - 100) / 10));
            if (maxProcedural > 10) {
                for (let fl = 11; fl <= Math.min(maxProcedural + 2, 11 + 6); fl++) {
                    const f = getFloorData(fl);
                    const canEnter = f.andar <= user.dungeonFloor || userLevel >= f.minLevel;
                    const isBoss = (f.andar % 5 === 0);
                    const icon = canEnter ? (isBoss ? "👑" : "🟢") : "🔒";
                    const bossTag = isBoss ? " 🐲 *(CHEFE CÓSMICO)*" : "";
                    doc += `┃ ${icon} *Andar ${f.andar}:* ${f.nome}${bossTag}\n`;
                    doc += `┃    📌 Requer Nível ${f.minLevel} (${f.reqCp.toLocaleString("pt-BR")} CP) | 💰 +${f.coins.toLocaleString("pt-BR")} Coins | ⭐ +${f.xp.toLocaleString("pt-BR")} XP\n`;
                    doc += `┃    🎁 Drop: ${f.drop}\n┃\n`;
                }
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `♾️ _A masmorra possui andares infinitos com chefes a cada 5 andares! Ao vencer, o próximo andar é desbloqueado imediatamente._\n\n`;
            doc += `💡 _Para explorar seu andar atual liberado:_ \`.dungeon\`\n`;
            doc += `💡 _Para repetir um andar ou farmar o Boss:_ \`.dungeon <número>\` (Ex: \`.dungeon 5\`)\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // 2. ENTRAR NO ANDAR ESCOLHIDO OU NO ANDAR ATUAL LIBERADO
        let currentFloor;
        const requestedFloorNum = parseInt(sub, 10);

        if (!isNaN(requestedFloorNum) && requestedFloorNum >= 1) {
            const targetData = getFloorData(requestedFloorNum);
            const canEnter = requestedFloorNum <= user.dungeonFloor || userLevel >= targetData.minLevel || stats.cp >= (targetData.reqCp * 0.8);
            if (!canEnter) {
                return reply(`🔒 *ANDAR BLOQUEADO!*\n\nO *Andar ${targetData.andar} (${targetData.nome})* ainda não foi liberado!\n\n📌 *Para Desbloquear:*\n• Conquiste o Andar ${targetData.andar - 1} com \`.dungeon ${targetData.andar - 1}\`\n• Ou atinja Nível *${targetData.minLevel}* (CP Recomendado: ${targetData.reqCp.toLocaleString("pt-BR")} CP)\n\n(Seu Nível: ${userLevel} | Seu Andar Atual Liberado: ${user.dungeonFloor})`);
            }
            currentFloor = targetData;
        } else {
            currentFloor = getFloorData(user.dungeonFloor || 1);
        }

        const isBossFloor = (currentFloor.andar % 5 === 0);

        // Cálculo balanceado de vitória
        const winProbability = Math.min(95, Math.max(30, Math.floor((stats.cp / currentFloor.reqCp) * 65)));
        const roll = Math.floor(Math.random() * 100) + 1;
        const won = roll <= winProbability;

        if (!won) {
            const hpLoss = Math.floor(stats.hpMax * (isBossFloor ? 0.45 : 0.35));
            user.hp = Math.max(1, (user.hp || stats.hpMax) - hpLoss);
            await dataService.saveXpData(xpData);

            let failDoc = `╔══════════════════════════════╗\n`;
            failDoc += `║   ☠️ *DERROTADO NA MASMORRA!* ☠️   \n`;
            failDoc += `╚══════════════════════════════╝\n\n`;
            failDoc += `🏰 *Andar:* Andar ${currentFloor.andar} — ${currentFloor.nome}${isBossFloor ? ' 🐲 *(CHEFE DO ANDAR)*' : ''}\n`;
            failDoc += `💥 *Resultado:* ${isBossFloor ? 'O Chefe do calabouço esmagou suas defesas!' : 'Você foi encurralado pelos monstros do calabouço!'}\n`;
            failDoc += `💔 *Dano Sofrido:* -${hpLoss.toLocaleString("pt-BR")} HP (Seu HP: ${user.hp}/${stats.hpMax})\n\n`;
            failDoc += `💡 _Aprimore suas armas no ferreiro (\`.forjar\`), compre armaduras (\`.shoparmaduras\`) e cure-se com \`.curar-max\` antes de tentar novamente._\n`;
            failDoc += `👑 *${botName}*`;
            return reply(failDoc.trim(), [sender]);
        }

        // VITÓRIA NO ANDAR: Avança a progressão do jogador se venceu o andar atual
        if (currentFloor.andar >= user.dungeonFloor) {
            user.dungeonFloor = currentFloor.andar + 1;
        }
        user.dungeonRecorde = Math.max(user.dungeonRecorde || 0, currentFloor.andar);

        // Aplica o bônus de 25% de XP por Rebirth
        const { aplicarBonusRebirthXp } = require("../../services/xpService");
        const xpGanho = aplicarBonusRebirthXp(user, currentFloor.xp);
        user.xp = (user.xp || 0) + xpGanho;
        user.coins = (user.coins || 0) + currentFloor.coins;

        if (!Array.isArray(user.inventario)) user.inventario = [];
        const limiteMochila = user.mochila || 20;
        let dropGanho = false;
        if (user.inventario.length < limiteMochila) {
            user.inventario.push(currentFloor.drop);
            dropGanho = true;
        }

        // Equipamento REAL do catálogo (20% na masmorra, 40% em andar de Boss)
        let equipDrop = null;
        try {
            const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService');
            const equipChance = isBossFloor ? 0.40 : 0.20;
            if (user.inventario.length < limiteMochila && Math.random() < equipChance) {
                equipDrop = sortearEquipamentoDrop((user.level || 1) + (isBossFloor ? 10 : 5));
                if (equipDrop) user.inventario.push({ ...equipDrop });
            }
        } catch (equipErr) {
            logger.warn('[DUNGEON] Falha no drop de equipamento: ' + equipErr.message);
        }

        await dataService.saveXpData(xpData);

        let winDoc = `╔══════════════════════════════╗\n`;
        winDoc += `║   🏆 *ANDAR DA MASMORRA CONQUISTADO!* 🏆   \n`;
        winDoc += `╚══════════════════════════════╝\n\n`;
        winDoc += `🏰 *Andar:* **Andar ${currentFloor.andar} — ${currentFloor.nome}**\n`;
        winDoc += `👤 *Guerreiro:* @${sender.split("@")[0]}\n`;
        if (isBossFloor) {
            winDoc += `👑 *CHEFE ELIMINADO COM SUCESSO!* 🐲\n`;
            winDoc += `🔓 *O Andar ${currentFloor.andar + 1} foi desbloqueado com glória!*\n`;
            winDoc += `💡 _O Chefe deste andar retornou ao seu covil e pode ser enfrentado novamente com \`.dungeon ${currentFloor.andar}\` para farm de loots e equipamentos._\n`;
        } else {
            winDoc += `🚪 *Próximo Desafio:* Andar ${user.dungeonFloor} liberado!\n`;
        }
        winDoc += `\n`;

        winDoc += `╭━〔 🎁 RECOMPENSAS DO CALABOUÇO 〕━⬣\n`;
        const rebBadge = stats.rebirths > 0 ? ` _(+${stats.rebirths * 25}% Rebirth)_` : '';
        winDoc += `┃ ⭐ *XP Ganho:* +${xpGanho.toLocaleString("pt-BR")} XP${rebBadge}\n`;
        winDoc += `┃ 💰 *Coins Coletados:* +${currentFloor.coins.toLocaleString("pt-BR")} Coins\n`;
        if (dropGanho) {
            winDoc += `┃ 🎁 *Drop Adquirido:* ${currentFloor.drop}\n`;
        } else {
            winDoc += `┃ ⚠️ *Mochila Cheia:* Drop não pôde ser guardado. Aumente com \`.mochila up\`!\n`;
        }
        if (equipDrop) {
            winDoc += `┃ ✨ *Equipamento:* ${equipDrop.raridade} *${equipDrop.nome}*\n`;
            winDoc += `┃    ⚔️ ATK +${equipDrop.atk} | 🛡️ DEF +${equipDrop.def} | ⚡ ${equipDrop.cp} CP\n`;
            winDoc += `┃    💡 \`.equipar ${equipDrop.id}\`\n`;
        }
        winDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        winDoc += `💡 _Para avançar para o próximo andar liberado:_ \`.dungeon\`\n`;
        winDoc += `👑 *${botName}*`;

        return reply(winDoc.trim(), [sender]);
    }
};
