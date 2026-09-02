/**
 * MeliodasBot — Comando Central .dossie / .perfil
 * Exibe o dossiê detalhado com 100% de persistência e dados reais do SQLite
 */

const dataService = require("../../services/dataService");
const { getDatabase } = require("../../database/connection");
const { initializeUser, barraXP, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { calculateCharacterStats, getItem } = require("../../services/rpgEquipmentService");
const { getOwnerRank } = require("../../services/ownerService");
const { resolveUserRole, ROLES } = require("../../services/permissionService");
const { getAdvancedNetworkTelemetry } = require("../../services/telemetryDeviceService");
const groupAuthService = require("../../services/groupAuthService");
const env = require("../../config/env");
const logger = require("../../core/logger");

module.exports = {
    name: "dossie",
    aliases: ["perfil", "dossier", "ficha", "investigar", "info-user", "perfilcompleto", "meuperfil"],
    category: "general",
    description: "Exibe o dossiê de inteligência, dispositivo, telemetria e perfil completo com dados reais do SQLite",
    cooldownMs: 2000,
    execute: async ({ sender, senderReal, from, isGroup, isAdmin, isOwner, client, reply, info, args }) => {
        try {
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const quotedParticipant = info?.message?.extendedTextMessage?.contextInfo?.participant;
            const argClean = (args && args[0]) ? args[0].replace(/[@\s]/g, "").replace(/\D/g, "") : "";
            const isExplicitTarget = Boolean(mentioned || quotedParticipant || (argClean && argClean.length >= 8));
            const targetJid = isExplicitTarget 
                ? (mentioned || quotedParticipant || (argClean + "@s.whatsapp.net")) 
                : (senderReal || sender);

            const isSelf = !isExplicitTarget || 
                           (targetJid.split("@")[0].split(":")[0] === sender.split("@")[0].split(":")[0]) ||
                           (senderReal && targetJid.split("@")[0].split(":")[0] === senderReal.split("@")[0].split(":")[0]);

            const targetCandidateJids = [targetJid].filter(Boolean);
            let resolvedPhone = null;

            // Resolução de número real do WhatsApp em grupos
            if (isGroup && client && typeof client.groupMetadata === "function") {
                try {
                    const gmeta = await client.groupMetadata(from).catch(() => null);
                    if (gmeta && gmeta.participants) {
                        const targetClean = targetJid.split("@")[0].split(":")[0];
                        const matchP = gmeta.participants.find(p => {
                            const pid = (p.id || "").split("@")[0].split(":")[0];
                            const plid = (p.lid || "").split("@")[0].split(":")[0];
                            return pid === targetClean || plid === targetClean;
                        });
                        if (matchP) {
                            if (matchP.id && matchP.id.endsWith("@s.whatsapp.net")) {
                                resolvedPhone = matchP.id.split("@")[0].split(":")[0];
                                targetCandidateJids.push(matchP.id);
                            }
                            if (matchP.lid) targetCandidateJids.push(matchP.lid);
                        }
                    }
                } catch (_) {}
            }

            if (client) {
                try {
                    const rReal = await groupAuthService.resolveRealJid(client, targetJid);
                    if (rReal) {
                        targetCandidateJids.push(rReal);
                        if (rReal.endsWith("@s.whatsapp.net")) resolvedPhone = rReal.split("@")[0].split(":")[0];
                    }
                    const rLid = await groupAuthService.resolvePnToLid(client, targetJid);
                    if (rLid) targetCandidateJids.push(rLid);
                } catch (_) {}
            }

            const callerCandidateJids = [sender, senderReal].filter(Boolean);
            const xpData = dataService.getXpData();
            const user = initializeUser(targetJid, xpData, targetCandidateJids);

            if (resolvedPhone && !user.phone) {
                user.phone = resolvedPhone;
            }
            if (user.phone) targetCandidateJids.push(user.phone + "@s.whatsapp.net");
            if (user.jid) targetCandidateJids.push(user.jid);
            if (user.lid) targetCandidateJids.push(user.lid);

            // Alocação de farm para registros históricos
            if ((user.messagesGroup === 0 && user.messagesPv === 0) && (user.messages || 0) > 0) {
                user.messagesGroup = user.messages;
                user.xpGroup = user.xp || 0;
                user.commandsGroup = Math.floor(user.messages * 0.1);
            }

            const tele = getAdvancedNetworkTelemetry(isSelf ? info : null, targetJid, sender, user);
            if (isSelf) {
                user.lastDevice = tele.device.model;
                user.lastPingMs = tele.pingMs;
                user.lastSeen = Date.now();
                if (info?.pushName && (!user.name || user.name !== info.pushName)) {
                    user.name = info.pushName;
                }
            }

            user.bank = Number(user.bank || user.banco || 0);
            user.banco = user.bank;
            dataService.saveUser(user);

            // Formatação do Número Real e Menção Clicável
            const isLidTarget = targetJid.endsWith("@lid") || (user.jid && user.jid.endsWith("@lid"));
            let phoneFormatted = "";
            let mentionTag = "";

            if (user.phone && /^\d{10,14}$/.test(user.phone)) {
                phoneFormatted = env.formatPhoneFromJid(user.phone + "@s.whatsapp.net");
                mentionTag = user.phone;
            } else if (!isLidTarget && /^\d{10,14}$/.test(targetJid.split("@")[0].split(":")[0])) {
                mentionTag = targetJid.split("@")[0].split(":")[0];
                phoneFormatted = env.formatPhoneFromJid(mentionTag + "@s.whatsapp.net");
            } else if (isLidTarget) {
                mentionTag = targetJid.split("@")[0].split(":")[0];
                phoneFormatted = `🔒 Criptografado (LID: ${mentionTag})`;
            } else {
                mentionTag = targetJid.split("@")[0].split(":")[0];
                phoneFormatted = targetJid;
            }

            const idDisplay = "@" + mentionTag + (user.name ? ` (~${user.name})` : "");

            // Resolução de Hierarquia e Cargos
            const callerOwnerRank = getOwnerRank(sender, callerCandidateJids);
            const targetOwnerRank = getOwnerRank(targetJid, targetCandidateJids);
            const isTargetOwner = Boolean(targetOwnerRank && targetOwnerRank.active);

            const userRole = resolveUserRole(targetJid, isAdmin, isTargetOwner);
            let cargoBot = "👶 Membro Comum";

            if (isTargetOwner && targetOwnerRank) {
                cargoBot = "👑 *Dono do Bot* (" + targetOwnerRank.rank + ": " + (targetOwnerRank.name || user.name || "Dono") + ")";
            } else if (userRole.level >= ROLES.BOT_ADMIN) {
                cargoBot = "🛡️ *Administrador do Bot*";
            } else if (userRole.level >= ROLES.TRUSTED) {
                cargoBot = "⭐ *Usuário de Confiança (Trusted)*";
            }

            // Cálculos RPG & Equipamentos Reais
            const rpgStats = calculateCharacterStats(user);
            const maxXp = calcularXpNecessario(user.level || 1);
            const currentXp = user.xp || 0;
            const progressoPercent = Math.min(100, Math.floor((currentXp / maxXp) * 100));
            const barra = barraXP(currentXp, user.level || 1);
            const cargoNome = getCargo(user.level || 1);

            let rankPosition = "#1";
            try {
                const db = getDatabase();
                const rankRow = db.prepare("SELECT COUNT(*) + 1 as rank FROM users WHERE xp > ?").get(currentXp);
                if (rankRow && rankRow.rank) {
                    rankPosition = "#" + rankRow.rank;
                }
            } catch (_) {}

            // Grupos em comum
            const allIdentifiers = new Set(targetCandidateJids.concat([user.jid, user.phone ? (user.phone + "@s.whatsapp.net") : null]).filter(Boolean).map(j => j.split("@")[0].split(":")[0]));
            let sharedGroups = [];
            if (client && typeof client.groupFetchAllParticipating === "function") {
                try {
                    const fetchPromise = client.groupFetchAllParticipating();
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
                    const allGroups = await Promise.race([fetchPromise, timeoutPromise]);
                    if (allGroups && typeof allGroups === "object") {
                        const groupList = Object.values(allGroups);
                        sharedGroups = groupList
                            .filter(g => g.participants?.some(p => {
                                const pid = (p.id || p.jid || "").split("@")[0].split(":")[0];
                                return allIdentifiers.has(pid);
                            }))
                            .map(g => ({ id: g.id, name: g.subject || "Grupo de WhatsApp" }));
                    }
                } catch (_) {}
            }

            if (sharedGroups.length > 0 && client && typeof client.groupInviteCode === "function") {
                for (const g of sharedGroups.slice(0, 5)) {
                    try {
                        const code = await client.groupInviteCode(g.id);
                        if (code) {
                            g.link = "https://chat.whatsapp.com/" + code;
                        }
                    } catch (_) {}
                }
            }

            const totalCmds = (user.commandsGroup || 0) + (user.commandsPv || 0);
            const armaRef = user.slots?.arma || user.arma || user.equipado;
            const armaNome = armaRef ? (typeof armaRef === 'object' ? armaRef.nome : (getItem(armaRef)?.nome || user.arma || "Espada de Ferro")) : "Punhos de Ferro";
            const forgeSufixo = user.forgeLevel > 0 ? ` +${user.forgeLevel}` : "";

            const itensMochila = (user.inventario && Array.isArray(user.inventario)) ? user.inventario.length : 0;
            const capMochila = user.mochila || Math.max(20, Math.floor((user.level || 1) * 2));

            let pocaoInfo = "Nenhuma";
            if (user.pocaoAtiva && user.pocaoAtiva.expira > Date.now()) {
                const minutosRestantes = Math.max(0, Math.ceil((user.pocaoAtiva.expira - Date.now()) / 60000));
                pocaoInfo = (user.pocaoAtiva.tipo || "Buff") + " (" + minutosRestantes + "m restantes)";
            }

            const farmGrupoMsgs = user.messagesGroup || 0;
            const farmPvMsgs = user.messagesPv || 0;
            const farmGrupoXp = user.xpGroup || 0;
            const farmPvXp = user.xpPv || 0;
            const totalMensagens = (farmGrupoMsgs + farmPvMsgs) || user.messages || 0;

            const hpMaximo = rpgStats.hpMax;
            const hpAtual = Math.min(hpMaximo, user.hp || hpMaximo);

            let doc = "╔══════════════════════════════╗\n";
            doc += "║    📁 *DOSSIÊ DE IDENTIDADE* 📁   ║\n";
            doc += "╚══════════════════════════════╝\n\n";

            doc += "╭━〔 👤 DADOS PESSOAIS & ACESSO 〕━⬣\n";
            doc += "┃ 📱 *WhatsApp:* " + phoneFormatted + "\n";
            doc += "┃ 🆔 *ID do Usuário:* " + idDisplay + "\n";
            doc += "┃ 🎖️ *Hierarquia:* " + cargoBot + "\n";
            doc += "┃ 💻 *Dispositivo:* " + tele.device.model + "\n";
                        doc += "┃ ⚡ *Latência Socket:* " + tele.pingMs + " ms (Jitter: " + tele.jitter + "ms)\n";
                        doc += "┃ 🤝 *Reputação:* ⭐ " + (user.rep || 0) + " pontos | 🔥 *Streak:* " + (user.streak || 0) + " dias\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

            doc += "╭━〔 📊 ESTATÍSTICAS DE FARM & MENSAGENS 〕━⬣\n";
            doc += "┃ 💬 *Farm no Grupo:* " + farmGrupoMsgs.toLocaleString('pt-BR') + " msgs (" + (user.commandsGroup || 0).toLocaleString('pt-BR') + " cmds | " + farmGrupoXp.toLocaleString('pt-BR') + " XP)\n";
            doc += "┃ 🔒 *Farm no Privado:* " + farmPvMsgs.toLocaleString('pt-BR') + " msgs (" + (user.commandsPv || 0).toLocaleString('pt-BR') + " cmds | " + farmPvXp.toLocaleString('pt-BR') + " XP)\n";
            doc += "┃ 🌟 *Total Unificado:* " + totalMensagens.toLocaleString('pt-BR') + " mensagens (" + totalCmds.toLocaleString('pt-BR') + " comandos)\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

            doc += "╭━〔 ⚔️ CARREIRA RPG & AVENTURA 〕━⬣\n";
            doc += "┃ 📈 *Nível:* " + (user.level || 1) + "  " + barra + " (" + progressoPercent + "%)\n";
            doc += "┃ ⭐ *XP Atual:* " + currentXp.toLocaleString('pt-BR') + " / " + maxXp.toLocaleString('pt-BR') + " XP\n";
            doc += "┃ 🏆 *Rank Global:* " + rankPosition + "\n";
            doc += "┃ 💼 *Profissão RPG:* " + cargoNome + "\n";
            doc += "┃ ⚡ *Poder de Combate (CP):* " + rpgStats.cp.toLocaleString('pt-BR') + " CP (ATK: " + rpgStats.atk + " | DEF: " + rpgStats.def + ")\n";
            doc += "┃ ❤️ *Vida (HP):* " + hpAtual.toLocaleString('pt-BR') + " / " + hpMaximo.toLocaleString('pt-BR') + " HP\n";
            doc += "┃ 🗡️ *Equipamento:* " + armaNome + forgeSufixo + " | 🎒 *Mochila:* " + itensMochila + " / " + capMochila + " slots\n";
            doc += "┃ 🧪 *Poção Ativa:* " + pocaoInfo + "\n";
            doc += "┃ 🛡️ *Guilda:* " + (user.guilda || "Sem Guilda") + " | 🐾 *Pet:* " + (user.pet || "Nenhum") + "\n";
            doc += "┃ ⚔️ *Combates:* " + (user.wins || 0) + " Vitórias | " + (user.losses || 0) + " Derrotas | 💀 " + (user.bossesMortos || 0) + " Bosses\n";
            doc += "┃ 🏟️ *Arena PvP:* " + (user.arenaPontos || 0) + " pts (Arena " + (user.arenaAtual || 1) + ") | 🏅 *Conquistas:* " + ((user.conquistas && user.conquistas.length) || 0) + "\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

            doc += "╭━〔 💰 PATRIMÔNIO & FINANÇAS 〕━⬣\n";
            doc += "┃ 💵 *Carteira:* " + (user.coins || 0).toLocaleString('pt-BR') + " Coins\n";
            doc += "┃ 🏦 *Banco Seguro:* " + (user.bank || 0).toLocaleString('pt-BR') + " Coins\n";
            doc += "┃ 💎 *Patrimônio Total:* " + ((user.coins || 0) + (user.bank || 0)).toLocaleString('pt-BR') + " Coins\n";
            doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

            if (sharedGroups.length > 0) {
                doc += "╭━〔 🌐 GRUPOS EM COMUM (" + sharedGroups.length + ") 〕━⬣\n";
                sharedGroups.forEach((g, idx) => {
                    doc += "┃ " + (idx + 1) + ". " + g.name + "\n";
                    if (g.link) doc += "┃    🔗 " + g.link + "\n";
                });
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
            }

            doc += "💡 _Para listar comandos de perfil e economia: .menu eco_\n";
            doc += "👑 *MeliodasBot*";

            return reply(doc.trim(), [targetJid, sender]);
        } catch (e) {
            logger.error("Erro ao executar comando .dossie:", e);
            return reply("❌ Ocorreu um erro ao gerar o dossiê: " + e.message);
        }
    }
};
