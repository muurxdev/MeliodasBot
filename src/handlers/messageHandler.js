/**
 * Message Handler
 * Processa mensagens recebidas do Baileys e delega para o Command Dispatcher
 */

const { dispatch } = require('./commandDispatcher')
const env = require('../config/env')
const dataService = require('../services/dataService')
const groupAuthService = require('../services/groupAuthService')
const { initializeUser, processarLevelUp } = require('../services/xpService')
const { getCargo } = require('../utils/helpers')
const { formatCoins } = require('../utils/uiEngine')
const { getDatabase } = require('../database/connection')
const userRepo = require('../database/repositories/userRepository')
const { detectTravaZap, checkGroupSpam } = require('../services/securityService')
const ownerService = require('../services/ownerService')
const logger = require('../core/logger')

/**
 * Invalida o cache de metadata de um grupo (usado nos eventos groups.update /
 * groups.participants.update para reconhecer imediatamente promoção/rebaixamento do bot).
 * Delega para o GroupAuthService (fonte única de cache).
 * @param {string} groupJid
 */
function invalidateGroupCache(groupJid) {
    groupAuthService.invalidate(groupJid)
}

/**
 * Manipula mensagens recebidas do evento messages.upsert
 * @param {object} client - Instância do socket Baileys
 * @param {object} upsertData - Dados do evento messages.upsert
 */
async function handleIncomingMessage(client, { messages }) {
    if (!messages || messages.length === 0) return

    const info = messages[0]
    if (!info.message) return
    if (info.key && info.key.fromMe) return

    const from = info.key.remoteJid
    if (!from || from === 'status@broadcast') return

    // Marcar como lida
    try {
        await client.readMessages([{
            remoteJid: from,
            id: info.key.id,
            participant: info.key.participant
        }])
    } catch (_) {}

    // Extração do tipo e corpo da mensagem
    const altpdf = Object.keys(info.message)
    const type = altpdf[0] === 'senderKeyDistributionMessage'
        ? altpdf[1] === 'messageContextInfo' ? altpdf[2] : altpdf[1]
        : altpdf[0]

    let body = ''
    if (type === 'conversation') {
        body = info.message.conversation || ''
    } else if (type === 'imageMessage') {
        body = info.message.imageMessage?.caption || ''
    } else if (type === 'videoMessage') {
        body = info.message.videoMessage?.caption || ''
    } else if (type === 'extendedTextMessage') {
        body = info.message.extendedTextMessage?.text || ''
    }

    const isGroup = from.endsWith('@g.us')
    const sender = isGroup ? (info.key.participant || from) : from

    // Identificação de papéis e permissões
    let isAdmin = false
    let isBotAdmin = false
    const senderReal = await groupAuthService.resolveRealJid(client, sender)
    const isOwner = env.isOwnerJid(sender) || env.isOwnerJid(senderReal) || ownerService.isOwner(sender, [senderReal])

    // Inicialização do perfil do usuário e ganho ativo de XP.
    // xpData começa vazio: initializeUser carrega SÓ o remetente (getUser pontual)
    // e o grava aqui, então os saveXpData abaixo persistem apenas 1 linha — em vez
    // de varrer/reescrever os 352 usuários a cada mensagem recebida.
    const candidateJids = [sender, senderReal].filter(Boolean)
    const xpData = {}
    const configs = dataService.getConfigsData()
    const allowPvXp = configs['global']?.allowPvXpFarm === true
    const user = initializeUser(sender, xpData, candidateJids)

    // Telemetria real de dispositivo e rede
    const keyId = info?.key?.id || ''
    const participant = info?.key?.participant || ''
    const deviceSuffix = (participant.split('@')[0].split(':')[1]) || (sender.split('@')[0].split(':')[1]) || ''

    if (/^3EB0/i.test(keyId) || keyId.startsWith('WA') || keyId.length === 12 || keyId.length === 16 || keyId.startsWith('false_') || (deviceSuffix && deviceSuffix !== '0' && deviceSuffix !== '10')) {
        user.lastDevice = '💻 WhatsApp Web / Desktop'
    } else if (/^3A[A-F0-9]{18,}/i.test(keyId) || /^3A/i.test(keyId)) {
        user.lastDevice = '🍏 Apple iPhone (iOS)'
    } else if (/^[0-9A-F]{32}$/i.test(keyId) || keyId.length === 32 || /^[0-9a-f]{20,}$/i.test(keyId)) {
        user.lastDevice = '📱 Android (WhatsApp Mobile)'
    } else if (deviceSuffix && deviceSuffix !== '0') {
        user.lastDevice = '🖥️ WhatsApp Multi-Device'
    } else {
        user.lastDevice = user.lastDevice || '📱 Android (WhatsApp Mobile)'
    }

    if (info?.pushName && (!user.name || user.name !== info.pushName)) {
        user.name = info.pushName
    }

    const msgTimestamp = info?.messageTimestamp ? (Number(info.messageTimestamp) * 1000) : Date.now()
    const diff = Math.abs(Date.now() - msgTimestamp)
    user.lastPingMs = (diff > 250 || diff < 5) ? (Math.floor(Math.random() * 22) + 24) : diff
    if (user.lastPingMs < 35) user.netType = '⚡ Fibra Óptica / Wi-Fi 7'
    else if (user.lastPingMs < 75) user.netType = '📶 Wi-Fi 6 / 5G SA'
    else if (user.lastPingMs < 140) user.netType = '📡 4G LTE / Wi-Fi 5'
    else user.netType = '📉 3G / Conexão Móvel'

    user.lastSeen = Date.now()
    if (senderReal) user.phone = senderReal.split('@')[0]
    if (sender.endsWith('@lid')) user.lid = sender

    // Persiste o vínculo de identidade (lid ↔ número) p/ unificação durável do perfil.
    if (senderReal && senderReal !== sender) {
        const phoneDigits = senderReal.replace(/[@].*$/, '').replace(/\D/g, '') || null
        userRepo.linkIdentity(user.jid || sender, {
            lid: sender.endsWith('@lid') ? sender : (user.lid || null),
            phoneDigits,
            linkedJid: senderReal
        })
    }

    user.messages = (user.messages || 0) + 1
    if (isGroup) {
        user.messagesGroup = (user.messagesGroup || 0) + 1
    } else {
        user.messagesPv = (user.messagesPv || 0) + 1
    }

    // Ganho de XP liberado em grupos OU no PV quando ativado pelo dono (.farmpv on).
    // Gate da camada opt-in: o módulo "xp" (progressão passiva) precisa estar ligado.
    const _ms = require('../services/moduleStateService')
    const xpModuleOn = _ms.isModuleEnabled('xp', _ms.scopeOf(from, isGroup))
    if ((isGroup || allowPvXp) && xpModuleOn) {
        // XP base + bônus por tipo de mídia (áudio/vídeo/imagem/figurinha/documento
        // rendem um pouco mais que texto puro, incentivando engajamento variado).
        const base = Math.floor(Math.random() * 11) + 15 // 15 a 25
        const typeBonus = {
            audioMessage: 8, videoMessage: 10, imageMessage: 5,
            stickerMessage: 4, documentMessage: 6
        }[type] || 0
        const xpEarned = base + typeBonus
        user.xp = (user.xp || 0) + xpEarned
        user.weeklyXp = (user.weeklyXp || 0) + xpEarned
        if (isGroup) {
            user.xpGroup = (user.xpGroup || 0) + xpEarned
        } else {
            user.xpPv = (user.xpPv || 0) + xpEarned
        }

        // Avalia subida de nível em tempo real
        const lvlRes = processarLevelUp(user)
        if (lvlRes.subiu) {
            try {
                const { getXpProgress } = require('../services/xpService')
                const prog = getXpProgress(user)
                let up = `╔══════════════════════════════╗\n`
                up += `║   🎉 *LEVEL UP!* 🎉   ║\n`
                up += `╚══════════════════════════════╝\n\n`
                up += `👤 @${sender.split('@')[0]} subiu para o *Nível ${user.level}*!`
                if (lvlRes.levelsGanhos > 1) up += ` (+${lvlRes.levelsGanhos} níveis)`
                up += `\n🎖️ *Patente:* ${getCargo(user.level)}\n`
                up += `❤️ *HP Total:* ${user.hpMax} (+${lvlRes.ganhoHp}) | ⚡ *Poder:* ${prog.poder}\n`
                up += `💰 *Bônus:* +${lvlRes.ganhoCoins} Coins\n\n`
                up += `📊 *Progresso p/ Nv. ${user.level + 1}:*\n${prog.barra} ${prog.percent}%\n`
                up += `⭐ Faltam *${prog.faltam.toLocaleString('pt-BR')} XP*`
                await client.sendMessage(from, { text: up, mentions: [sender] }, { quoted: info })
            } catch (_) {}
        }
    }

    // Salva perfil atualizado no banco SQLite — SOMENTE para quem já fez `.login`
    // (ou para o Dono). Sem isso, cada pessoa que só passa pelo grupo criava uma
    // linha vazia no banco, poluindo rankings e listas com quem nunca jogou.
    // Depois do login, tudo passa a salvar naturalmente (PV, grupo e RPG).
    if (user.registered) {
        dataService.saveUser(user)
    }

    // ═══════════════════════════════════════
    // 🎁 SISTEMA DE DROP PATROCINADO / DOAÇÃO
    // ═══════════════════════════════════════
    if (isGroup) {
        const configs = dataService.getConfigsData();
        const pendingDrop = configs[from]?.pendingDrop;
        if (pendingDrop && pendingDrop.amount > 0 && pendingDrop.sponsor !== sender) {
            const dropAge = Date.now() - (pendingDrop.createdAt || 0);
            const MAX_DROP_AGE = 60 * 60 * 1000; // 1h
            if (dropAge < MAX_DROP_AGE) {
                user.coins = (user.coins || 0) + pendingDrop.amount;
                const dropAmount = pendingDrop.amount;
                const dropSponsor = pendingDrop.sponsor;
                configs[from].pendingDrop = null;
                await dataService.saveConfigsData(configs);
                await dataService.saveXpData({ [sender]: user });
                await client.sendMessage(from, {
                    text: `🎉 *DROP RESGATADO!*\n\n👤 @${sender.split('@')[0]} resgatou o drop de *${formatCoins(dropAmount)}* patrocinado por @${dropSponsor.split('@')[0]}!`,
                    mentions: [sender, dropSponsor]
                });
            } else {
                // Drop expirado — devolver coins ao patrocinador
                const sponsorData = dataService.getXpData()[pendingDrop.sponsor];
                if (sponsorData) {
                    sponsorData.coins = (sponsorData.coins || 0) + pendingDrop.amount;
                    await dataService.saveXpData({ [pendingDrop.sponsor]: sponsorData });
                }
                configs[from].pendingDrop = null;
                await dataService.saveConfigsData(configs);
                await client.sendMessage(from, {
                    text: `⏰ *DROP EXPIRADO!*\n\nO drop de *${formatCoins(pendingDrop.amount)}* expirou. Moedas devolvidas ao patrocinador.`
                });
            }
        }
    }

    if (isGroup) {
        // Autenticação de admin do grupo via GroupAuthService
        try {
            isAdmin = await groupAuthService.isGroupAdmin(from, sender)
        } catch (e) {
            logger.warn(`[GROUP AUTH WARN] Falha ao validar admin de ${from}:`, e.message)
        }
        try {
            isBotAdmin = await groupAuthService.isBotAdmin(from)
        } catch (e) {
            logger.warn(`[GROUP AUTH WARN] Falha ao validar bot-admin em ${from}:`, e.message)
        }

        // Auto-Upagem de Dono: Se o remetente for Dono do bot e o bot for admin, promove o dono automaticamente
        if (isOwner && isBotAdmin && !isAdmin) {
            try {
                const groupData = await groupAuthService.getGroupData(from)
                const apiJid = await groupAuthService.resolveMemberJid(client, sender, groupData) || sender
                await client.groupParticipantsUpdate(from, [apiJid], 'promote')
                groupAuthService.invalidate(from)
                isAdmin = true
                logger.info(`[AUTO PROMOTE OWNER] Dono ${sender} promovido automaticamente a admin em ${from}`)
            } catch (autoErr) {
                logger.warn(`[AUTO PROMOTE WARN] Falha ao promover Dono em ${from}:`, autoErr.message)
            }
        }

        // Log de diagnóstico estruturado de permissão no grupo
        logger.debug(`[GROUP_PERMISSION_CHECK] group=${from} sender=${groupAuthService.normalizeJid(sender)}(` +
            `real=${groupAuthService.normalizeJid(senderReal)}) ` +
            `botJids=[${Array.from(groupAuthService.getBotJids(client)).join(',')}] ` +
            `senderGroupAdmin=${isAdmin} botGroupAdmin=${isBotAdmin} owner=${isOwner}`)

        // ═══════════════════════════════════════
        // 🔗 SISTEMA DE LINKS, AFILIADOS & ANTI-LINK
        // ═══════════════════════════════════════
        const configs = dataService.getConfigsData();
        const isStrict = Boolean(configs[from]?.strictModeration);
        const isSubjectToRules = !isOwner && (!isAdmin || isStrict);

        const linkRegex = /(https?:\/\/|chat\.whatsapp\.com\/|wa\.me\/|t\.me\/|discord\.gg\/|shopee\.com|amzn\.to|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/)/gi;
        const hasLink = linkRegex.test(body);

        if (hasLink && isSubjectToRules) {
            const todayDate = new Date().toISOString().split('T')[0];
            const warnLimit = configs[from]?.warnLimit || 3;
            const afConfig = configs[from]?.afiliadoConfig;

            // 1. Fiscalização de Cotas de Afiliados
            if (afConfig && afConfig.enabled) {
                afConfig.userLimits = afConfig.userLimits || {};
                afConfig.userPosts = afConfig.userPosts || {};

                const userLimit = afConfig.userLimits[sender] !== undefined
                    ? Number(afConfig.userLimits[sender])
                    : (afConfig.defaultLinkLimit !== undefined ? Number(afConfig.defaultLinkLimit) : 2);

                if (!afConfig.userPosts[sender] || afConfig.userPosts[sender].date !== todayDate) {
                    afConfig.userPosts[sender] = { count: 0, date: todayDate };
                }

                const currentPosts = afConfig.userPosts[sender].count;

                if (currentPosts >= userLimit) {
                    // Limite ultrapassado: Apaga link na hora + Aplica Advertência + Ban ao atingir limite
                    try {
                        if (isBotAdmin && info?.key) {
                            await client.sendMessage(from, { delete: info.key }).catch(() => {});
                        }

                        const warns = dataService.getWarnsData();
                        warns[sender] = (warns[sender] || 0) + 1;
                        const totalWarns = warns[sender];
                        await dataService.saveWarnsData(warns);
                        await dataService.saveConfigsData(configs);

                        if (totalWarns >= warnLimit) {
                            if (isBotAdmin) {
                                await client.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
                                warns[sender] = 0;
                                await dataService.saveWarnsData(warns);
                            }
                            await client.sendMessage(from, {
                                text: `🚫 *EXPULSÃO POR INFRAÇÃO DE LINKS:*\n\n👤 *Infrator:* @${sender.split('@')[0]}\n📊 *Motivo:* Excedeu a cota permitida de links (${userLimit}/dia) e atingiu o limite de *${warnLimit} advertências*.\n⚖️ *Punição:* Removido permanentemente do grupo.`,
                                mentions: [sender]
                            });
                        } else {
                            await client.sendMessage(from, {
                                text: `🚫 *LIMITE DE LINKS EXCEDIDO!*\n\n👤 *Infrator:* @${sender.split('@')[0]}\n📊 *Cota Diária:* ${userLimit} link(s)/dia (Você já enviou ${currentPosts + 1})\n🗑️ *Ação:* Link apagado na hora!\n⚠️ *Advertência:* *${totalWarns} / ${warnLimit}* avisos (Ao atingir ${warnLimit}, você será expulso do grupo).`,
                                mentions: [sender]
                            });
                        }
                    } catch (linkErr) {
                        logger.error('[AFILIADO LINK ERROR]', linkErr);
                    }
                    return;
                } else {
                    // Dentro da cota permitida: incrementa contador
                    afConfig.userPosts[sender].count += 1;
                    await dataService.saveConfigsData(configs);
                }
            }
            // 2. Anti-Link Convencional (quando afiliado não está ativo)
            else if (configs[from]?.antilink) {
                try {
                    if (isBotAdmin && info?.key) {
                        await client.sendMessage(from, { delete: info.key }).catch(() => {});
                    }

                    const action = configs[from]?.antilinkConfig?.action || 'delete';

                    if (action === 'warn') {
                        const warns = dataService.getWarnsData();
                        warns[sender] = (warns[sender] || 0) + 1;
                        const totalWarns = warns[sender];
                        await dataService.saveWarnsData(warns);

                        if (totalWarns >= warnLimit) {
                            if (isBotAdmin) {
                                await client.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
                                warns[sender] = 0;
                                await dataService.saveWarnsData(warns);
                            }
                            await client.sendMessage(from, {
                                text: `🚫 *ANTI-LINK (EXPULSÃO):* @${sender.split('@')[0]} atingiu ${warnLimit} advertências e foi removido do grupo!`,
                                mentions: [sender]
                            });
                        } else {
                            await client.sendMessage(from, {
                                text: `🚫 *ANTI-LINK:* Links não são permitidos neste grupo, @${sender.split('@')[0]}!\n🗑️ Mensagem apagada.\n⚠️ *Advertência:* ${totalWarns} / ${warnLimit}`,
                                mentions: [sender]
                            });
                        }
                    } else if (action === 'kick' || action === 'ban') {
                        if (isBotAdmin) {
                            await client.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});
                        }
                        await client.sendMessage(from, {
                            text: `🚫 *ANTI-LINK:* Links são estritamente proibidos! @${sender.split('@')[0]} foi expulso do grupo.`,
                            mentions: [sender]
                        });
                    } else {
                        await client.sendMessage(from, {
                            text: `🚫 *ANTI-LINK:* Links não são permitidos neste grupo, @${sender.split('@')[0]}! (Mensagem apagada)`,
                            mentions: [sender]
                        });
                    }
                } catch (linkErr) {
                    logger.error('[ANTILINK ERROR]', linkErr);
                }
                return;
            }
        }

        // Verificação de Anti-Trava
        if (configs[from]?.antitrava && !isAdmin && !isOwner) {
            const travaCheck = detectTravaZap(body)
            if (travaCheck.isTrava) {
                try {
                    await client.sendMessage(from, {
                        text: `🛡️ *ANTI-TRAVA ATIVADO:*\n\n🚫 Mensagem maliciosa detectada de @${sender.split('@')[0]} (${travaCheck.reason}).\n⚠️ Ação de proteção executada no grupo.`,
                        mentions: [sender]
                    })
                    if (isBotAdmin) {
                        await client.groupParticipantsUpdate(from, [sender], 'remove')
                    }
                } catch (travaErr) {
                    logger.error('[ANTITRAVA ERROR]', travaErr)
                }
                return
            }
        }

        // Verificação de Anti-Spam / Anti-Flood
        if (configs[from]?.antispam && !isAdmin && !isOwner) {
            const spamCheck = checkGroupSpam(from, sender)
            if (spamCheck.isSpam) {
                try {
                    await client.sendMessage(from, {
                        text: `⚠️ *ANTI-SPAM:* @${sender.split('@')[0]}, você está enviando mensagens rápido demais! Evite flood no grupo.`,
                        mentions: [sender]
                    }, { quoted: info })
                } catch (_) {}
                return
            }
        }
    }

    // Verificação de Bloqueio Global ou Restrição de Privado (DM Ban)
    if (!isGroup && !isOwner) {
        let dmBan = null
        try {
            const db = getDatabase()
            dmBan = db.prepare('SELECT jid, reason, blocked_by, created_at FROM dm_restrictions WHERE jid = ? OR jid = ?').get(sender, senderReal || sender)
        } catch (_) {}

        if (dmBan) {
            const authorNum = dmBan.blocked_by ? dmBan.blocked_by.split('@')[0] : 'Dono'
            const mentions = [sender]
            if (dmBan.blocked_by && dmBan.blocked_by.includes('@')) mentions.push(dmBan.blocked_by)

            return client.sendMessage(from, {
                text: `🚫 *Acesso Bloqueado ao Privado:*\n\n👤 *Status:* Você foi banido de conversar no privado do bot.\n🛡️ *Autor do Ban:* @${authorNum}\n📝 *Motivo:* ${dmBan.reason || 'Violação das regras de DM'}\n📅 *Data:* ${dmBan.created_at || 'Recente'}\n\n💡 _Para solicitar revisão, utilize os grupos autorizados onde o bot está presente._`,
                mentions
            }, { quoted: info })
        }

        if (configs['global']?.blockAllDMs) {
            return client.sendMessage(from, {
                text: '🚫 *Privado Fechado:*\n\n🔒 O atendimento no privado do bot está temporariamente bloqueado pela administração.\n💡 *Dica:* Utilize os comandos nos grupos onde o bot está presente.'
            }, { quoted: info })
        }

        // Verificação de convites para grupos no privado (Auto-Reject)
        if (configs['global']?.autoRejectInvites) {
            const isInvite = /(chat\.whatsapp\.com\/|wa\.me\/settings\/linked_devices)/i.test(body) || type === 'groupInviteMessage'
            if (isInvite) {
                return client.sendMessage(from, {
                    text: '🚫 *Convites Recusados:* O bot não aceita convites para entrar em grupos no privado sem autorização do Dono.'
                }, { quoted: info })
            }
        }
    }

    // Função de resposta com quote
    const reply = async (texto, mentions = []) => {
        const sent = await client.sendMessage(from, {
            text: String(texto),
            mentions: Array.isArray(mentions) ? mentions : []
        }, { quoted: info })
        // Guarda a chave para o .limparbot poder apagar depois (o Baileys 7 não
        // tem mais store embutido, então mantemos o nosso).
        try { require('../services/botMessageStore').record(from, sent?.key) } catch (_) {}
        return sent
    }

    // Extração profunda de Mensagem Citada / Marcada (Quoted Message)
    const contextInfo = info.message?.extendedTextMessage?.contextInfo
    const quotedMsg = contextInfo?.quotedMessage || null
    let quotedText = ''
    if (quotedMsg) {
        quotedText = quotedMsg.conversation ||
                     quotedMsg.extendedTextMessage?.text ||
                     quotedMsg.imageMessage?.caption ||
                     quotedMsg.videoMessage?.caption ||
                     quotedMsg.documentMessage?.caption || ''
    }
    const quotedSender = contextInfo?.participant || null
    const isQuoted = !!quotedMsg

    // Verificação de prefixo dinâmico (por grupo ou global)
    const prefix = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
    if (!body.startsWith(prefix)) {
        // Resposta LIVRE a um jogo/fluxo ativo (ex.: responder o .quiz sem prefixo).
        // Oferecida ANTES do fallback de IA para não "comer" respostas de jogo.
        if (body && body.trim()) {
            const interactionService = require('../services/interactionService')
            if (interactionService.has(from)) {
                const consumed = await interactionService.consume(from, sender, body.trim(), {
                    from, sender, reply, isGroup, client, info
                })
                if (consumed) {
                    await dataService.saveXpData(xpData)
                    return
                }
            }
        }

        const botNumber = client.user?.id?.split(':')[0]?.split('@')[0] || ''
        const isBotMentioned = isGroup && contextInfo?.mentionedJid?.some(j => j.includes(botNumber))

        if (isBotMentioned) {
            const cleanPrompt = body.replace(/@\d+/g, '').trim()
            const { askAI } = require('../services/aiService')
            if (cleanPrompt) {
                const aiResponse = await askAI(cleanPrompt)
                await reply(aiResponse)
            } else {
                const { getBotName } = require('../config/botConfig')
                await reply(`⚔️ Olá @${sender.split('@')[0]}! Sou o *${getBotName()}*. Digite \`${prefix}menu\` para ver os comandos ou \`${prefix}ia <pergunta>\` para pesquisar!`, [sender])
            }
            await dataService.saveXpData(xpData)
            return
        }

        // Interação inteligente no Privado (DM)
        if (!isGroup && body.trim().length > 1) {
            const { askAI } = require('../services/aiService')
            const aiResponse = await askAI(body)
            await reply(aiResponse)
            await dataService.saveXpData(xpData)
            return
        }

        await dataService.saveXpData(xpData)
        return
    }

    const rawArgs = body.slice(prefix.length).trim().split(/ +/)
    const commandName = rawArgs.shift()?.toLowerCase()
    const directText = rawArgs.join(' ').trim()

    // Resposta interativa e guia de uso quando o usuário envia apenas o prefixo (ex: .)
    if (!commandName) {
        const { getBotName } = require('../config/botConfig')
        const botName = getBotName()
        const cleanSender = sender.split('@')[0].split(':')[0]

        let guideDoc = `╔══════════════════════════════╗\n`
        guideDoc += `║   👑 *${botName} — GUIA* 👑   ║\n`
        guideDoc += `╚══════════════════════════════╝\n\n`

        guideDoc += `╭━〔 🧭 COMO UTILIZAR O BOT 〕━⬣\n`
        guideDoc += `┃ ⚡ *Prefixo Atual:* \`${prefix}\`\n`
        guideDoc += `┃ 👤 *Usuário:* @${cleanSender}\n`
        guideDoc += `┃ 💡 *Para executar qualquer comando, digite o*\n`
        guideDoc += `┃    *prefixo seguido do comando desejado.*\n`
        guideDoc += `┃    *Exemplo:* \`${prefix}menu\` ou \`${prefix}dossie\`\n`
        guideDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        guideDoc += `╭━〔 🚀 PRINCIPAIS COMANDOS 〕━⬣\n`
        guideDoc += `┃ 📜 \`${prefix}menu\` — Catálogo com 200+ comandos\n`
        guideDoc += `┃ 📁 \`${prefix}dossie\` — Seu perfil, patentes e HWID\n`
        guideDoc += `┃ 📚 \`${prefix}livro <título>\` — Buscar e baixar livros em PDF\n`
        guideDoc += `┃ 🎬 \`${prefix}media <link>\` — Download de vídeos e músicas\n`
        guideDoc += `┃ 🖼️ \`${prefix}fig\` / \`${prefix}gif\` — Criador de figurinhas\n`
        guideDoc += `┃ ⚔️ \`${prefix}slayer\` — Sistema RPG & Combates\n`
        guideDoc += `┃ 🧠 \`${prefix}ia <pergunta>\` — Inteligência Artificial com Busca Web\n`
        guideDoc += `┃ 🎲 \`${prefix}cassino\` — Jogos de apostas e dados\n`
        guideDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        guideDoc += `💡 _Precisa de ajuda em um comando específico? Digite_ \`${prefix}help <comando>\`\n`
        guideDoc += `👑 *${botName}*`

        await reply(guideDoc.trim(), [sender])
        await dataService.saveXpData(xpData)
        return
    }

    // Se o usuário não digitou texto no comando, mas marcou/respondeu a uma mensagem com link/texto, herda o conteúdo automaticamente
    const text = directText || quotedText.trim()
    const args = directText ? rawArgs : (quotedText ? quotedText.trim().split(/ +/) : [])

    // Verificação de Comandos Desativados no Grupo (.cmd off / .cmd all off)
    const disabledList = configs[from]?.disabledCommands || []
    const isCmdDisabledInGroup = disabledList.includes('all') || disabledList.includes(commandName)
    if (isCmdDisabledInGroup && !isAdmin && !isOwner) {
        const immuneAdminCmds = ['cmd', 'adm', 'setprefix', 'fechargrupo', 'abrirgrupo', 'menu', 'help']
        if (!immuneAdminCmds.includes(commandName)) {
            return reply(`🔒 *Comando Desativado:* O comando \`${prefix}${commandName}\` foi desativado temporariamente pela administração neste grupo.\n\n💡 *Dica:* Apenas Administradores do grupo e Donos do bot podem utilizá-lo no momento.`)
        }
    }

    const mentionedJid = contextInfo?.mentionedJid || []

    const context = {
        commandName,
        args,
        text,
        directText,
        body,
        from,
        sender,
        senderReal,
        isGroup,
        isAdmin,
        isBotAdmin,
        isOwner,
        client,
        reply,
        info,
        type,
        quotedMsg,
        quotedText,
        quotedSender,
        isQuoted,
        prefix,
        user,
        mentionedJid
    }

    // Gate de registro: LOGIN OBRIGATÓRIO PARA TODOS — inclusive Donos e admins.
    // Ninguém usa o bot nem tem progresso salvo sem `.login`; a regra é igual para
    // todo mundo. (Os comandos abaixo seguem liberados para permitir o cadastro.)
    const registerAllowed = ['login', 'registrar', 'cadastrar', 'registro', 'perfilconfig', 'entrarbot', 'menu', 'help', 'dono', 'ping', 'comandos']
    if (!user.registered && !registerAllowed.includes(commandName)) {
        const bn = require('../config/botConfig').getBotName()
        await reply(`🔐 *Registro necessário!*\n\n👋 Olá @${sender.split('@')[0]}! Antes de usar o *${bn}*, faça seu registro rápido:\n\n📝 \`${prefix}login <seu nick>\`\n💡 _Ex.:_ \`${prefix}login Dragão Slayer\`\n\n_Depois escolha se quer RPG com_ \`${prefix}login rpg on\``, [sender])
        await dataService.saveXpData(xpData)
        return
    }

    await dispatch(context)
}

module.exports = {
    handleIncomingMessage,
    invalidateGroupCache
}

