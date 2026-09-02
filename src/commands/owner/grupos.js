/**
 * MeliodasBot — Comando .grupos
 * Lista todos os grupos onde o bot está presente com contagem de membros e status de admin
 */

const logger = require('../../core/logger')

module.exports = {
    name: 'grupos',
    aliases: ['grouplist', 'listagrupos', 'meusgrupos'],
    category: 'owner',
    description: 'Lista todos os grupos do WhatsApp onde o bot está presente',
    ownerOnly: true,
    cooldownMs: 3000,
    execute: async ({ client, reply }) => {
        try {
            const allGroups = await client.groupFetchAllParticipating()
            const groupsList = Object.values(allGroups)

            if (!groupsList || groupsList.length === 0) {
                return reply('ℹ️ O bot não está participando de nenhum grupo no momento.')
            }

            const botNumber = client.user?.id?.split(':')[0]?.split('@')[0] || ''

            let doc = `╔══════════════════════════════╗\n`
            doc += `║    📋 *GRUPOS CONECTADOS* (${groupsList.length})   ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            groupsList.forEach((g, index) => {
                const isBotAdmin = g.participants?.some(p => {
                    const pNum = p.id?.split(':')[0]?.split('@')[0] || ''
                    return pNum === botNumber && (p.admin === 'admin' || p.admin === 'superadmin')
                })

                doc += `╭━〔 #${index + 1} — *${g.subject}* 〕━⬣\n`
                doc += `┃ 🆔 *JID:* \`${g.id}\`\n`
                doc += `┃ 👥 *Membros:* ${g.participants?.length || 0}\n`
                doc += `┃ 👑 *Bot é Admin:* ${isBotAdmin ? '✅ Sim' : '❌ Não'}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `💡 _Para sair de um grupo:_ \`.sair <JID>\``

            return reply(doc.trim())
        } catch (err) {
            logger.error('[GRUPOS ERROR]', err)
            return reply(`❌ *Erro ao listar grupos:* ${err.message}`)
        }
    }
}

