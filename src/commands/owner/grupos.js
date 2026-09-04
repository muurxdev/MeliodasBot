/**
 * Comando .grupos
 * Lista todos os grupos onde o bot está presente com contagem de membros e status de admin
 */

const logger = require('../../core/logger')

const groupAuthService = require('../../services/groupAuthService')

module.exports = {
    name: 'grupos',
    aliases: ['grouplist', 'listagrupos'],
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

            // Identidade do bot pela fonte única (cobre o número E o @lid). A
            // comparação antiga só olhava o número, e no Baileys 7 os participantes
            // chegam como @lid — por isso TODO grupo aparecia como "não admin".
            const botJids = groupAuthService.getBotJids(client)

            let doc = `╔══════════════════════════════╗\n`
            doc += `║    📋 *GRUPOS CONECTADOS* (${groupsList.length})   ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            groupsList.forEach((g, index) => {
                const isBotAdmin = (g.participants || []).some(p => {
                    const isAdm = p.admin === 'admin' || p.admin === 'superadmin'
                    if (!isAdm) return false
                    const pj = groupAuthService.normalizeJid(p.id || p.jid || '')
                    return [...botJids].some(b => b && pj && b === pj)
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

