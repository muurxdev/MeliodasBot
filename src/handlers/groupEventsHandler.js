/**
 * Group Events Handler
 * Processa eventos em tempo real de grupos (Entrada, Saída, Promoção e Rebaixamento de Admins)
 * com suporte completo a mensagens personalizadas e templates dinâmicos
 */

const dataService = require("../services/dataService");
const { getWallpaperBuffer } = require("../utils/wallpapers");
const logger = require("../core/logger");
// Fonte única das mensagens de saudação (mesma usada pelo .welcome/.leave -config).
const { formatTemplate, buildWelcomeMessage, buildLeaveMessage } = require("../services/groupGreetingService");

async function handleGroupParticipantsUpdate(client, update) {
    const { id: groupJid, participants, action, author } = update;
    if (!groupJid || !participants || !Array.isArray(participants) || participants.length === 0) return;

    const configs = dataService.getConfigsData();
    const groupConfig = configs[groupJid] || {};

    const welcomeEnabled = (groupConfig.welcome === true || groupConfig.welcomeEnabled === true || groupConfig.welcome === 1 || groupConfig.welcome === "on" || groupConfig.welcome === "true") && 
                           (groupConfig.welcome !== false && groupConfig.welcome !== "false" && groupConfig.welcome !== "off" && groupConfig.welcome !== 0 && groupConfig.welcome !== "0" && groupConfig.welcomeEnabled !== false);

    const leaveEnabled = (groupConfig.leave === true || groupConfig.leaveEnabled === true || groupConfig.leave === 1 || groupConfig.leave === "on" || groupConfig.leave === "true") && 
                         (groupConfig.leave !== false && groupConfig.leave !== "false" && groupConfig.leave !== "off" && groupConfig.leave !== 0 && groupConfig.leave !== "0" && groupConfig.leaveEnabled !== false);

    const eventsEnabled = groupConfig.events !== false && groupConfig.events !== "false" && groupConfig.events !== "off" && groupConfig.events !== 0 && groupConfig.events !== "0";

    if (!eventsEnabled) return;

    let groupName = "Grupo";
    let groupDesc = "";
    let memberCount = 0;

    try {
        const meta = await client.groupMetadata(groupJid);
        if (meta?.subject) groupName = meta.subject;
        if (meta?.desc) groupDesc = meta.desc;
        if (meta?.participants) memberCount = meta.participants.length;
    } catch (_) {}

    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });

    for (const p of participants) {
        const participant = typeof p === "string" ? p : (p?.id || p?.jid || String(p));
        const userNumber = participant.split("@")[0].split(":")[0];
        const userTag = "@" + userNumber;
        const mentions = [participant];
        if (author && typeof author === "string" && author.includes("@")) mentions.push(author);

        try {
            // 1. ENTRADA DE NOVO MEMBRO (ADD)
            if (action === "add" && welcomeEnabled) {
                const captionText = buildWelcomeMessage(groupConfig, { userTag, groupName, groupDesc, memberCount, timeStr });

                const { getMenuMedia } = require("../utils/wallpapers");
                const media = getMenuMedia("welcome");
                if (media && media.buffer) {
                    if (media.type === "video") {
                        await client.sendMessage(groupJid, {
                            video: media.buffer,
                            caption: captionText.trim(),
                            gifPlayback: true,
                            mimetype: "video/mp4",
                            mentions
                        });
                    } else {
                        await client.sendMessage(groupJid, {
                            image: media.buffer,
                            caption: captionText.trim(),
                            mentions
                        });
                    }
                } else {
                    await client.sendMessage(groupJid, { text: captionText.trim(), mentions });
                }
                logger.info("[GROUP_EVENT] Welcome enviado para @" + userNumber + " em " + groupJid);
            }

            // 2. SAÍDA DE MEMBRO (REMOVE)
            else if (action === "remove" && leaveEnabled) {
                const captionText = buildLeaveMessage(groupConfig, { userTag, groupName, groupDesc, memberCount, timeStr });

                const { getMenuMedia } = require("../utils/wallpapers");
                const media = getMenuMedia("leave");
                if (media && media.buffer) {
                    if (media.type === "video") {
                        await client.sendMessage(groupJid, {
                            video: media.buffer,
                            caption: captionText.trim(),
                            gifPlayback: true,
                            mimetype: "video/mp4",
                            mentions
                        });
                    } else {
                        await client.sendMessage(groupJid, {
                            image: media.buffer,
                            caption: captionText.trim(),
                            mentions
                        });
                    }
                } else {
                    await client.sendMessage(groupJid, { text: captionText.trim(), mentions });
                }
                logger.info("[GROUP_EVENT] Leave enviado para @" + userNumber + " em " + groupJid);
            }

            // 3. PROMOÇÃO A ADMINISTRADOR (PROMOTE)
            else if (action === "promote") {
                const authorTag = (author && typeof author === "string") ? ("@" + author.split("@")[0].split(":")[0]) : "a administração";
                let text = "╔══════════════════════════════╗\n";
                text += "║   ⭐ *NOVO ADMINISTRADOR* ⭐   ║\n";
                text += "╚══════════════════════════════╝\n\n";
                text += "👑 Parabéns " + userTag + "! Você foi promovido(a) a *Administrador(a)* do grupo *" + groupName + "* por " + authorTag + "!\n\n";
                text += "🛡️ _Use seus poderes de moderação com responsabilidade e justiça!_";

                await client.sendMessage(groupJid, { text: text.trim(), mentions });
                logger.info("[GROUP_EVENT] Promote notificado para @" + userNumber + " em " + groupJid);
            }

            // 4. REBAIXAMENTO DE ADMINISTRADOR (DEMOTE)
            else if (action === "demote") {
                const authorTag = (author && typeof author === "string") ? ("@" + author.split("@")[0].split(":")[0]) : "a administração";
                let text = "🔻 *CARGO ALTERADO:* " + userTag + " foi rebaixado(a) a membro comum em *" + groupName + "* por " + authorTag + ".";
                await client.sendMessage(groupJid, { text: text.trim(), mentions });
                logger.info("[GROUP_EVENT] Demote notificado para @" + userNumber + " em " + groupJid);
            }
        } catch (err) {
            logger.error("[GROUP_EVENT_ERROR] Falha ao processar " + action + " para " + participant + " em " + groupJid + ":", err);
        }
    }
}

module.exports = {
    handleGroupParticipantsUpdate,
    formatTemplate
};
