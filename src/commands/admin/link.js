/**
 * Comando .link / .linkgrupo / .convite
 * Gera e lista o link oficial de convite do grupo
 */

const logger = require('../../core/logger')

module.exports = {
    name: 'link',
    aliases: ['linkgrupo', 'convite', 'grouplink', 'groupinvite'],
    category: 'admin',
    description: 'Gera e exibe o link oficial de convite do grupo atual',
    cooldownMs: 2000,
    execute: async ({ from, isGroup, client, isOwner, isBotAdmin, reply, args }) => {
        // 1. Execução dentro de Grupos
        if (isGroup) {
            try {
                const groupMetadata = await client.groupMetadata(from)

                if (!isBotAdmin) {
                    return reply('❌ *Acesso Negado:* O bot precisa ser *Administrador* deste grupo para conseguir gerar o link de convite oficial.')
                }

                const code = await client.groupInviteCode(from)
                const groupLink = `https://chat.whatsapp.com/${code}`

                let doc = `╔══════════════════════════════╗\n`
                doc += `║   🔗 *LINK DE CONVITE DO GRUPO*   ║\n`
                doc += `╚══════════════════════════════╝\n\n`
                doc += `📌 *Grupo:* *${groupMetadata.subject}*\n`
                doc += `👥 *Participantes:* ${groupMetadata.participants?.length || 0}\n`
                doc += `🌐 *Link Oficial:* ${groupLink}\n\n`
                doc += `⚠️ _Compartilhe este link apenas com pessoas autorizadas._`

                return reply(doc)
            } catch (err) {
                logger.error('[LINK COMMAND ERROR]', err)
                return reply(`❌ *Erro ao obter link do grupo:* ${err.message}`)
            }
        }

        // 2. Execução no Privado (DM) exclusiva para Donos
        if (!isGroup && isOwner) {
            try {
                const query = (args[0] || '').trim().toLowerCase()
                const chats = await client.groupFetchAllParticipating()
                const groupList = Object.values(chats)

                if (!query) {
                    let doc = `╔══════════════════════════════╗\n`
                    doc += `║     🌐 *GRUPOS DO BOT* 🌐     ║\n`
                    doc += `╚══════════════════════════════╝\n\n`
                    doc += `📊 *Total de Grupos:* ${groupList.length}\n\n`

                    groupList.slice(0, 15).forEach((g, idx) => {
                        doc += `╭━〔 #${idx + 1} — *${g.subject}* 〕━⬣\n`
                        doc += `┃ 🆔 \`${g.id}\`\n`
                        doc += `┃ 👥 ${g.participants?.length || 0} membros\n`
                        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
                    })

                    doc += `💡 _Para obter o link de um grupo específico no PV:_ \`.link <id_ou_nome>\``
                    return reply(doc)
                }

                // Busca grupo por ID ou nome
                const targetGroup = groupList.find(g => g.id === query || g.subject.toLowerCase().includes(query))
                if (!targetGroup) {
                    return reply(`❌ Nenhum grupo encontrado com a busca: "${query}"`)
                }

                try {
                    const code = await client.groupInviteCode(targetGroup.id)
                    const groupLink = `https://chat.whatsapp.com/${code}`

                    let doc = `╔══════════════════════════════╗\n`
                    doc += `║   🔗 *LINK DE CONVITE DO GRUPO*   ║\n`
                    doc += `╚══════════════════════════════╝\n\n`
                    doc += `📌 *Grupo:* *${targetGroup.subject}*\n`
                    doc += `🆔 *ID:* \`${targetGroup.id}\`\n`
                    doc += `👥 *Participantes:* ${targetGroup.participants?.length || 0}\n`
                    doc += `🌐 *Link Oficial:* ${groupLink}\n`

                    return reply(doc)
                } catch (codeErr) {
                    return reply(`⚠️ Não foi possível obter o link de *${targetGroup.subject}* porque o bot não é administrador desse grupo.`)
                }
            } catch (dmErr) {
                logger.error('[LINK DM ERROR]', dmErr)
                return reply(`❌ *Erro ao listar grupos:* ${dmErr.message}`)
            }
        }

        return reply('❌ Este comando só pode ser utilizado em grupos.')
    }
}

