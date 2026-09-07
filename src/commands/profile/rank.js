/**
 * Comando .rank / .top / .ranking
 * Rankings divididos e independentes para Grupo, Privado (PV), RPG, Skycode, Coins e Geral
 * Exibe níveis específicos de cada categoria e filtra estritamente usuários cadastrados via .login
 */

const dataService = require("../../services/dataService");
const { getCargo } = require("../../utils/helpers");
const groupAuthService = require("../../services/groupAuthService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "rank",
    aliases: [
        "top", "leaderboard", "ranking",
        "rankgrupo", "topgrupo", "rankgp",
        "rankpv", "toppv", "rankdm",
        "rankrpg", "toprpg",
        "rankskycode", "topskycode", "ranksky",
        "rankcoins", "topcoins",
        "rankgeral", "topglobal"
    ],
    category: "profile",
    description: "Exibe os rankings divididos de Grupo, Privado (PV), RPG, Skycode, Coins ou Geral",
    cooldownMs: 2500,
    execute: async ({ reply, from, isGroup, args, sender, command = "rank", prefix = "." }) => {
        const botName = getBotName();
        let mode = (args[0] || "").toLowerCase().trim();

        // Atalhos diretos por alias
        const cmdName = command.toLowerCase();
        if (["rankgrupo", "topgrupo", "rankgp"].includes(cmdName)) mode = "grupo";
        if (["rankpv", "toppv", "rankdm"].includes(cmdName)) mode = "pv";
        if (["rankrpg", "toprpg"].includes(cmdName)) mode = "rpg";
        if (["rankskycode", "topskycode", "ranksky"].includes(cmdName)) mode = "skycode";
        if (["rankcoins", "topcoins"].includes(cmdName)) mode = "coins";
        if (["rankgeral", "topglobal"].includes(cmdName)) mode = "geral";

        // ══════════════════════════════════════════════════
        // 0. MENU PRINCIPAL DE SELEÇÃO DE RANKINGS
        // ══════════════════════════════════════════════════
        if (!mode || mode === "menu" || mode === "ajuda" || mode === "help") {
            const regCount = dataService.userRepo.getRegisteredCount ? dataService.userRepo.getRegisteredCount() : 0;
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║    🏆 *CENTRAL DE RANKINGS* 🏆    ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📌 *MeliodasBot* conta com rankings separados e níveis independentes por atividade!\n`;
            doc += `👥 *Jogadores Cadastrados:* ${regCount.toLocaleString("pt-BR")}\n\n`;
            doc += `╭━〔 📂 SELECIONE UMA CATEGORIA 〕━⬣\n`;
            doc += `┃ 👥 \`${prefix}rank grupo\` ➔ Top deste Grupo *(Nível de Grupo & XP)*\n`;
            doc += `┃ 💬 \`${prefix}rank pv\` ➔ Top Privado *(Nível de PV & Comandos)*\n`;
            doc += `┃ ⚔️ \`${prefix}rank rpg\` ➔ Top RPG *(Nível RPG, Bosses & Vitórias)*\n`;
            doc += `┃ 🛰️ \`${prefix}rank skycode\` ➔ Membros Cadastrados no Skycode\n`;
            doc += `┃ 💰 \`${prefix}rank coins\` ➔ Top Magnatas *(Patrimônio em Moedas)*\n`;
            doc += `┃ 👑 \`${prefix}rank geral\` ➔ Top Geral Global\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `🔒 _Apenas usuários que criaram conta real via_ \`${prefix}login <nick>\` _participam dos rankings oficiais!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim());
        }

        // ══════════════════════════════════════════════════
        // 1. RANKING DO PRIVADO (PV)
        // ══════════════════════════════════════════════════
        if (mode === "pv" || mode === "dm" || mode === "privado") {
            const rankingPv = dataService.userRepo.getTopPv ? dataService.userRepo.getTopPv(10) : [];

            if (rankingPv.length === 0) {
                return reply("🏆 Nenhum usuário cadastrado com atividade no PV registrada ainda.");
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   💬 *TOP 10 RANKING DO PRIVADO (PV)* 💬   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingPv.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                mentions.push(jid);
                const pvLevel = u.levelPv || u.level_pv || 1;
                const pvXp = u.xpPv || u.xp_pv || 0;
                const pvCmds = u.commandsPv || u.commands_pv || 0;
                const pvCoins = u.coinsPv || u.coins_pv || 0;
                const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;

                doc += `${medal} *#${i + 1}* ${nick} (@${jid.split("@")[0]})\n`;
                doc += `📈 *Nível PV:* ${pvLevel} | ⭐ *XP PV:* ${pvXp.toLocaleString("pt-BR")} XP\n`;
                doc += `⌨️ *Comandos:* ${pvCmds.toLocaleString("pt-BR")}`;
                if (pvCoins > 0) doc += ` | 💰 *Coins PV:* ${pvCoins.toLocaleString("pt-BR")}`;
                doc += `\n\n`;
            });

            doc += `💡 _Níveis e XPs de PV são calculados separadamente de grupos e RPG!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // ══════════════════════════════════════════════════
        // 2. RANKING DE RPG & COMBATE
        // ══════════════════════════════════════════════════
        if (mode === "rpg" || mode === "combate" || mode === "batalha" || mode === "hunt") {
            const rankingRpg = dataService.userRepo.getTopRpg ? dataService.userRepo.getTopRpg(10) : [];

            if (rankingRpg.length === 0) {
                return reply("⚔️ Nenhum guerreiro cadastrado no RPG ainda.");
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ⚔️ *TOP 10 GUERREIROS DO RPG* ⚔️   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingRpg.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                mentions.push(jid);
                const rpgLevel = u.levelRpg || u.level_rpg || u.level || 1;
                const rpgXp = u.xpRpg || u.xp_rpg || u.xp || 0;
                const bosses = u.bossesMortos || u.bosses_mortos || 0;
                const wins = u.wins || 0;
                const rebirths = u.rebirthCount || u.rebirth_count || 0;
                const cargo = getCargo(rpgLevel);
                const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;

                doc += `${medal} *#${i + 1}* ${nick} [Nv. RPG ${rpgLevel}]${rebirths > 0 ? ` (🌀 ${rebirths}x)` : ""}\n`;
                doc += `⭐ *XP RPG:* ${rpgXp.toLocaleString("pt-BR")} | 🎖️ *Patente:* ${cargo}\n`;
                doc += `🐉 *Chefes Batidos:* ${bosses} | ⚔️ *Vitórias:* ${wins}\n\n`;
            });

            doc += `💡 _Upe no RPG com_ \`.hunt\`_,_ \`.dungeon\`_,_ \`.boss\` _e_ \`.duelo\`_!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // ══════════════════════════════════════════════════
        // 3. RANKING SKYCODE (APENAS MEMBROS CADASTRADOS)
        // ══════════════════════════════════════════════════
        if (mode === "skycode" || mode === "sky" || mode === "terminal") {
            const rankingSky = dataService.userRepo.getTopSkycode ? dataService.userRepo.getTopSkycode(10) : [];

            if (rankingSky.length === 0) {
                return reply("🛰️ Nenhum membro cadastrado no protocolo Skycode ainda.");
            }

            let doc = `╔════════════════════════════════════╗\n`;
            doc += `║   🛰️ *MEMBROS CADASTRADOS SKYCODE* 🛰️  ║\n`;
            doc += `╚════════════════════════════════════╝\n\n`;
            doc += `📡 *Protocolo Skycode:* Lista de identidades reais registradas no terminal.\n\n`;
            const mentions = [];

            rankingSky.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                mentions.push(jid);
                const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;
                const msgs = (u.messages || 0).toLocaleString("pt-BR");
                const lGroup = u.levelGroup || u.level_group || 1;
                const lPv = u.levelPv || u.level_pv || 1;
                const lRpg = u.levelRpg || u.level_rpg || u.level || 1;
                const regDate = u.registeredAt || u.registered_at || u.createdAt || u.created_at;
                const dateFmt = regDate ? new Date(regDate).toLocaleDateString("pt-BR") : "Recente";

                doc += `${medal} *#${i + 1}* ${nick} (@${jid.split("@")[0]})\n`;
                doc += `🔒 *Status:* [CADASTRADO ✅] | 📅 *Desde:* ${dateFmt}\n`;
                doc += `📊 *Níveis:* Grupo ${lGroup} · PV ${lPv} · RPG ${lRpg} | 💬 *Msgs:* ${msgs}\n\n`;
            });

            doc += `💡 _O Skycode audita dados 100% autênticos de contas cadastradas!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // ══════════════════════════════════════════════════
        // 4. RANKING DE COINS & ECONOMIA
        // ══════════════════════════════════════════════════
        if (mode === "coins" || mode === "rico" || mode === "riqueza" || mode === "economia") {
            const rankingCoins = dataService.userRepo.getTopCoins ? dataService.userRepo.getTopCoins(10) : [];

            if (rankingCoins.length === 0) {
                return reply("💰 Nenhum usuário cadastrado com saldo registrado.");
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   💰 *TOP 10 MAGNATAS (COINS)* 💰   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingCoins.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                mentions.push(jid);
                const coins = (u.coins || 0).toLocaleString("pt-BR");
                const bank = (u.bank || 0).toLocaleString("pt-BR");
                const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;

                doc += `${medal} *#${i + 1}* ${nick} (@${jid.split("@")[0]})\n`;
                doc += `🪙 *Carteira:* ${coins} Coins | 🏦 *Banco:* ${bank} Coins\n\n`;
            });

            doc += `💡 _Aumente seu patrimônio com_ \`.trabalhar\`_,_ \`.investir\` _e_ \`.cassino\`_!_\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // ══════════════════════════════════════════════════
        // 5. RANKING GERAL / GLOBAL
        // ══════════════════════════════════════════════════
        if (mode === "geral" || mode === "global" || (!isGroup && mode !== "grupo")) {
            const rankingGlobal = dataService.userRepo.getTopRank(10);

            if (rankingGlobal.length === 0) {
                return reply("🏆 Nenhum usuário cadastrado no ranking global ainda.");
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👑 *TOP 10 RANKING GERAL GLOBAL* 👑   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            const mentions = [];

            rankingGlobal.forEach(([jid, u], i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
                const lvl = u.level || 1;
                const cargo = getCargo(lvl);
                const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;
                const rebirths = u.rebirthCount || u.rebirth_count || 0;
                mentions.push(jid);

                doc += `${medal} *#${i + 1}* ${nick} [Nv. ${lvl}]${rebirths > 0 ? ` (🌀 ${rebirths}x)` : ""}\n`;
                doc += `⭐ *XP Total:* ${(u.xp || 0).toLocaleString("pt-BR")} | 💰 *Coins:* ${(u.coins || 0).toLocaleString("pt-BR")}\n`;
                doc += `🎖️ *Patente:* ${cargo}\n\n`;
            });

            doc += `💡 _Rankings específicos:_ \`.rank grupo\` | \`.rank pv\` | \`.rank rpg\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // ══════════════════════════════════════════════════
        // 6. RANKING EXCLUSIVO DO GRUPO ATUAL
        // ══════════════════════════════════════════════════
        let participantsList = null;
        if (isGroup) {
            try {
                const groupData = await groupAuthService.getGroupData(from);
                if (groupData?.participants && groupData.participants.length > 0) {
                    participantsList = new Set(groupData.participants.map(p => p.id.split(":")[0].split("@")[0]));
                }
            } catch (_) {}
        }

        const xpData = dataService.getXpData();
        const rankingGrupo = Object.entries(xpData)
            .filter(([jid, u]) => {
                // FILTRO ESTRITO: Apenas quem possui conta real criada
                if (!u.registered || !u.displayNick) return false;
                if (!participantsList) return true;
                const cleanJid = jid.split(":")[0].split("@")[0];
                return participantsList.has(cleanJid);
            })
            .sort((a, b) => {
                const lvlA = a[1].levelGroup || a[1].level_group || 1;
                const lvlB = b[1].levelGroup || b[1].level_group || 1;
                const xpA = a[1].xpGroup || a[1].xp_group || 0;
                const xpB = b[1].xpGroup || b[1].xp_group || 0;
                const scoreA = (lvlA * 1000000) + xpA;
                const scoreB = (lvlB * 1000000) + xpB;
                return scoreB - scoreA;
            })
            .slice(0, 10);

        if (rankingGrupo.length === 0) {
            return reply("👥 Nenhum membro deste grupo com login/cadastro ativo no momento.\n\n📝 Cadastre-se com `.login <seu nick>` para entrar no ranking!");
        }

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👥 *TOP 10 RANKING DESTE GRUPO* 👥   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        const mentions = [];

        rankingGrupo.forEach(([jid, u], i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
            mentions.push(jid);
            const lGroup = u.levelGroup || u.level_group || 1;
            const xpG = u.xpGroup || u.xp_group || 0;
            const msgs = (u.messages || 0).toLocaleString("pt-BR");
            const nick = u.displayNick || u.display_nick || u.name || `@${jid.split("@")[0]}`;

            doc += `${medal} *#${i + 1}* ${nick} (@${jid.split("@")[0]})\n`;
            doc += `📈 *Nível de Grupo:* ${lGroup} | ⭐ *XP Grupo:* ${xpG.toLocaleString("pt-BR")} XP\n`;
            doc += `💬 *Mensagens:* ${msgs}\n\n`;
        });

        doc += `💡 _Ver outros rankings:_ \`.rank pv\` | \`.rank rpg\` | \`.rank geral\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), mentions);
    }
};
