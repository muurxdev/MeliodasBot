/**
 * Comando .meusgrupos
 * Lista todos os grupos onde o usuário (ou o alvo marcado) e o bot participam juntos,
 * exibindo o Nome do Grupo, JID, Cargo do Usuário e Status do Bot.
 */

const groupAuthService = require('../../services/groupAuthService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'meusgrupos',
    aliases: ['mygroups', 'gruposmembro', 'ondeestou'],
    category: 'general',
    description: 'Lista todos os grupos e IDs (JIDs) onde você e o bot estão presentes juntos',
    cooldownMs: 4000,
    execute: async ({ client, reply, sender, senderReal, isOwner, info, args = [], quotedSender }) => {
        try {
            // Se for Dono e tiver marcado alguém, busca os grupos daquele usuário
            const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetJid = (isOwner && (mentioned || quotedSender || (args?.[0] && String(args[0]).replace(/[@+\s-]/g, '') + '@s.whatsapp.net'))) || sender

            const targetNum = targetJid.split(':')[0].split('@')[0]
            let targetReal = null
            try {
                targetReal = await groupAuthService.resolveRealJid(client, targetJid)
            } catch (_) {}
            const targetRealNum = targetReal ? targetReal.split(':')[0].split('@')[0] : targetNum

            const allGroups = await client.groupFetchAllParticipating()
            const groupsList = Object.values(allGroups)

            if (!groupsList || groupsList.length === 0) {
                return reply('ℹ️ O bot não está participando de nenhum grupo no momento.')
            }

            const botNumber = client.user?.id?.split(':')[0]?.split('@')[0] || ''

            // Filtra grupos onde o usuário alvo está presente
            const userGroups = []

            for (const g of groupsList) {
                const participant = g.participants?.find(p => {
                    const pNum = p.id?.split(':')[0]?.split('@')[0]
                    return pNum === targetNum || pNum === targetRealNum || groupAuthService.sameUser(p.id, targetJid) || (targetReal && groupAuthService.sameUser(p.id, targetReal))
                })

                if (participant) {
                    const isUserAdmin = participant.admin === 'admin' || participant.admin === 'superadmin'
                    const isBotAdmin = g.participants?.some(p => {
                        const pNum = p.id?.split(':')[0]?.split('@')[0]
                        return pNum === botNumber && (p.admin === 'admin' || p.admin === 'superadmin')
                    })

                    userGroups.push({
                        id: g.id,
                        subject: g.subject || 'Grupo sem nome',
                        size: g.participants?.length || 0,
                        isUserAdmin,
                        isBotAdmin
                    })
                }
            }

            if (userGroups.length === 0) {
                const isSelf = targetJid === sender
                return reply(isSelf
                    ? 'ℹ️ Você não foi encontrado em nenhum dos grupos onde o bot está presente.'
                    : `ℹ️ O usuário @${targetNum} não foi encontrado em nenhum dos grupos do bot.`, [targetJid])
            }

            const isSelf = targetJid === sender
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🏢 *GRUPOS ENCONTRADOS* (${userGroups.length})   ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            if (!isSelf) {
                doc += `👤 *Membro Inspecionado:* @${targetNum}\n\n`
            }

            userGroups.forEach((g, index) => {
                const userCargo = g.isUserAdmin ? '👑 Administrador' : '👤 Membro Comum'
                const botStatus = g.isBotAdmin ? '✅ Admin' : '▫️ Membro'

                doc += `╭━〔 #${index + 1} — *${g.subject}* 〕━⬣\n`
                doc += `┃ 🆔 *JID:* \`${g.id}\`\n`
                doc += `┃ 👥 *Membros:* ${g.size} participantes\n`
                doc += `┃ 💼 *Seu Cargo:* ${userCargo}\n`
                doc += `┃ 🤖 *${getBotName()}:* ${botStatus}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `💡 _Total de grupos vinculados:_ *${userGroups.length}*`

            return reply(doc.trim(), [targetJid])
        } catch (err) {
            logger.error('[MEUSGRUPOS ERROR]', err)
            return reply(`❌ *Erro ao buscar seus grupos:* ${err.message}`)
        }
    }
}

