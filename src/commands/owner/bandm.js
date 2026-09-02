/**
 * MeliodasBot — Comando .bandm
 * Gerencia o bloqueio global e individual de mensagens no privado (DM) do bot
 */

const { permissionRepo } = require('../../services/permissionService')
const dataService = require('../../services/dataService')
const logger = require('../../core/logger')

module.exports = {
    name: 'bandm',
    aliases: ['blockdm', 'dmblock', 'unbandm', 'bloqueardm'],
    category: 'owner',
    description: 'Bloqueia ou desbloqueia o privado do bot de forma global ou por usuário',
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ sender, args = [], text = '', reply, info, quotedSender }) => {
        const fullInput = (text || args.join(' ')).trim()
        const sub = (args[0] || '').toLowerCase()
        const configs = dataService.getConfigsData()
        if (!configs['global']) configs['global'] = {}

        // 1. LISTA DE BANS (.bandm list / .bandm lista)
        if (sub === 'list' || sub === 'lista') {
            const list = permissionRepo.getAllDmBlocked()
            const isGlobalOn = !!configs['global'].blockAllDMs
            const { getOwnerRank } = require('../../services/ownerService')

            let msg = `╔══════════════════════════════╗\n`
            msg += `║    🛡️ *PAINEL DE MODERAÇÃO DM* 🛡️   ║\n`
            msg += `╚══════════════════════════════╝\n\n`
            msg += `🌐 *Bloqueio Global (Todos):* ${isGlobalOn ? '🔒 *ATIVADO* (Responde aviso para todos)' : '🔓 *DESATIVADO* (Aberto)'}\n\n`

            if (list.length === 0) {
                msg += `ℹ️ _Nenhum usuário possui ban individual de DM no momento._`
                return reply(msg.trim())
            }

            msg += `📋 *USUÁRIOS COM BAN INDIVIDUAL (${list.length}):*\n\n`
            const mentions = []

            function formatPhoneNumber(jidOrNum) {
                if (!jidOrNum) return ''
                if (typeof jidOrNum === 'string' && jidOrNum.includes('@lid')) return jidOrNum
                const digits = String(jidOrNum).replace(/\D/g, '')
                if (!digits) return String(jidOrNum)

                // Brasil (+55)
                if (digits.startsWith('55') && digits.length >= 12) {
                    const ddd = digits.slice(2, 4)
                    const rest = digits.slice(4)
                    if (rest.length === 9) {
                        return `+55 ${ddd} ${rest.slice(0, 5)}-${rest.slice(5)}`
                    } else if (rest.length === 8) {
                        return `+55 ${ddd} ${rest.slice(0, 4)}-${rest.slice(4)}`
                    }
                }
                // Filipinas (+63)
                if (digits.startsWith('63') && digits.length >= 12) {
                    return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
                }
                // EUA / Canadá (+1)
                if (digits.startsWith('1') && digits.length === 11) {
                    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
                }
                return `+${digits}`
            }

            list.forEach((item, i) => {
                const userFormatted = formatPhoneNumber(item.jid)
                const authorOwner = item.blocked_by ? getOwnerRank(item.blocked_by) : null
                let authorInfo = ''

                if (authorOwner && authorOwner.name) {
                    authorInfo = `👑 *${authorOwner.rank}:* ${authorOwner.name} (${authorOwner.phone || formatPhoneNumber(item.blocked_by)})`
                } else if (item.blocked_by) {
                    authorInfo = `🛡️ *${formatPhoneNumber(item.blocked_by)}*`
                } else {
                    authorInfo = `🛡️ *Dono do Bot*`
                }

                const cleanReason = String(item.reason || 'Violação das regras de DM').replace(/^[@\s]+/, '').trim()

                msg += `╭━〔 #${i + 1} — *${userFormatted}* 〕━⬣\n`
                msg += `┃ 👤 *Autor do Ban:* ${authorInfo}\n`
                msg += `┃ 📝 *Motivo:* ${cleanReason}\n`
                msg += `┃ 📅 *Data:* ${item.created_at || 'Recente'}\n`
                msg += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            msg += `💡 _Para desbanir:_ \`.opendm <numero>\` ou \`.bandm off <numero>\``
            return reply(msg.trim())
        }

        // 2. LIMPAR TODOS OS BANS (.bandm clear / .bandm limpar / .bandm all off)
        if (sub === 'clear' || sub === 'limpar' || (sub === 'all' && args[1]?.toLowerCase() === 'off')) {
            configs['global'].blockAllDMs = false
            await dataService.saveConfigsData(configs)
            const list = permissionRepo.getAllDmBlocked()
            list.forEach(item => permissionRepo.setDmBlocked(item.jid, false))
            logger.info(`[BANDM] ${sender} removeu todos os ${list.length} bans de DM.`)
            return reply(`🔓 *TODOS OS BANS DE DM FORAM REMOVIDOS:* (${list.length} usuários liberados).`)
        }

        // 3. CONTROLE GLOBAL ON (.bandm on / .bandm global on)
        if (sub === 'on' || (sub === 'global' && args[1]?.toLowerCase() === 'on')) {
            configs['global'].blockAllDMs = true
            await dataService.saveConfigsData(configs)
            logger.info(`[BANDM GLOBAL] ${sender} ativou o bloqueio global de DM.`)
            return reply('🔒 *BLOQUEIO GLOBAL DE DM ATIVADO:*\n\n🚫 O bot agora responderá a qualquer membro comum que enviar mensagem no privado avisando que o atendimento está temporariamente fechado.\n👑 *Isenção:* Donos do bot continuam com acesso total.')
        }

        // 4. DESBLOQUEIO INDIVIDUAL OU CONTROLE GLOBAL OFF
        const isUnblockKeyword = sub === 'off' || sub === 'remover' || sub === 'desbanir' || sub === 'del' || info?.body?.startsWith('.unbandm')

        if (isUnblockKeyword) {
            // Extrai o restante do texto após a palavra-chave
            const remainder = fullInput.replace(/^(off|remover|desbanir|del|unbandm)\s*/i, '').trim()
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            let targetJid = mentioned || (remainder ? null : quotedSender)

            if (!targetJid && remainder) {
                const digits = remainder.replace(/\D/g, '')
                if (digits.length >= 8) {
                    targetJid = `${digits}@s.whatsapp.net`
                }
            }

            // Se não tem alvo específico, desativa o bloqueio global de DM
            if (!targetJid) {
                configs['global'].blockAllDMs = false
                await dataService.saveConfigsData(configs)
                logger.info(`[BANDM GLOBAL] ${sender} desativou o bloqueio global de DM.`)
                return reply('🔓 *BLOQUEIO GLOBAL DE DM DESATIVADO:*\n\nO privado do bot foi reaberto para mensagens gerais.')
            }

            // Desbloqueia o usuário específico
            permissionRepo.setDmBlocked(targetJid, false)
            logger.info(`[BANDM] ${sender} desbloqueou DM de ${targetJid}`)
            return reply(`🔓 *DM DESBLOQUEADA COM SUCESSO!*\n\nO usuário @${targetJid.split('@')[0]} agora pode enviar mensagens no privado do bot novamente.`, [targetJid])
        }

        // 5. BLOQUEIO INDIVIDUAL (.bandm @user [motivo] ou .bandm +55 11 99988-0200 [motivo])
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        let targetJid = mentioned || quotedSender || null
        let reason = ''

        if (!targetJid) {
            // Tenta achar dígitos de telefone no texto
            const digitsMatch = fullInput.match(/(\+?\d[\d\s\-()]{7,}\d)/)
            if (digitsMatch) {
                const cleanDigits = digitsMatch[1].replace(/\D/g, '')
                if (cleanDigits.length >= 8) {
                    targetJid = `${cleanDigits}@s.whatsapp.net`
                    reason = fullInput.replace(digitsMatch[0], '').trim()
                }
            }
        }

        if (!targetJid) {
            return reply('❌ Informe o usuário alvo ou o modo de operação.\n\n📌 *Exemplos:*\n• `.bandm on` _(Ativa bloqueio global do PV)_\n• `.bandm off` _(Desativa bloqueio global do PV)_\n• `.bandm list` _(Ver lista de bans e autores)_\n• `.bandm @usuario Spam no privado` _(Bane um usuário)_\n• `.bandm off @usuario` ou `.opendm @usuario` _(Desbane um usuário)_')
        }

        if (!reason) {
            reason = fullInput.replace(/@\d+/g, '').trim() || 'Violação das regras de mensagens privadas'
        }

        permissionRepo.setDmBlocked(targetJid, true, reason, sender)
        logger.info(`[BANDM] ${sender} bloqueou DM de ${targetJid}. Motivo: ${reason}`)

        await reply(`🔒 *DM BLOQUEADA COM SUCESSO!*\n\n👤 *Usuário Banido:* @${targetJid.split('@')[0]}\n🛡️ *Autor do Ban:* @${sender.split('@')[0]}\n📝 *Motivo:* ${reason}\n\n_O usuário receberá a justificativa e o autor caso tente enviar mensagens no privado._`, [targetJid, sender])
    }
}
