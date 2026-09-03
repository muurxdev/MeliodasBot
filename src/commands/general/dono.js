/**
 * Comando .dono / .donos / .owner
 * Exibe a hierarquia militar oficial dos 10 Donos do bot com menções e identificador de nomeação
 */

const { getOwners, resolveOwnerName } = require('../../services/ownerService')
const { getBotName } = require('../../config/botConfig')
const { formatPhoneFromJid } = require('../../config/env')

module.exports = {
    name: 'dono',
    aliases: ['owner', 'criador', 'donos', 'patentes', 'donodobot'],
    category: 'general',
    description: 'Exibe a hierarquia militar e contatos dos Donos oficiais do bot',
    execute: async ({ reply }) => {
        const owners = getOwners()
        const botName = getBotName()
        const mentions = []

        let doc = `╔══════════════════════════════╗\n`
        doc += `║    👑 *HIERARQUIA DE DONOS* 👑  ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        const icons = {
            'Capitão': '🎖️',
            'Tenente': '⚔️',
            'Sargento': '🛡️',
            'Cabo': '🔹',
            'Soldado': '▫️'
        }

        const rankTitles = {
            'Capitão': 'Capitão (Comandante Supremo)',
            'Tenente': 'Tenente (Sub-Comandante)',
            'Sargento': 'Sargento Oficial',
            'Cabo': 'Cabo de Elite',
            'Soldado': 'Soldado de Primeira Classe'
        }

        owners.forEach((o) => {
            const icon = icons[o.rank] || '👑'
            const baseTitle = rankTitles[o.rank] || o.rank
            const headerTitle = o.customTitle ? o.customTitle.toUpperCase() : o.rank.toUpperCase()
            const fullTitle = o.customTitle ? `${o.customTitle} (${baseTitle})` : baseTitle

            doc += `╭━〔 ${icon} *${headerTitle}* 〕━⬣\n`

            if (o.active && o.jid) {
                mentions.push(o.jid)
                const tagUser = `@${o.jid.split('@')[0]}`
                // Nome puxado ao vivo do perfil do WhatsApp (nome verde verificado)
                const liveName = resolveOwnerName(o)
                const displayName = liveName && liveName !== o.rank ? `${tagUser} (${liveName})` : tagUser
                const contactPhone = o.phone || formatPhoneFromJid(o.jid)

                doc += `┃ 👤 *Nome:* ${displayName}\n`
                doc += `┃ 👑 *Perfil:* ${o.rank === 'Capitão' ? 'Sou o Dono do Bot' : 'Sou Dono do Bot'}\n`
                if (contactPhone) {
                    doc += `┃ 📱 *Contato:* ${contactPhone}\n`
                }
                doc += `┃ 🆔 *Patente:* ${fullTitle}\n`

                if (o.appointedBy) {
                    doc += `┃ 🟢 *Nomeado por:* ${o.appointedBy}\n`
                }
            } else {
                doc += `┃ ▫️ *Status:* _Vago / Disponível_\n`
                doc += `┃ 🆔 *Patente:* ${fullTitle}\n`
            }
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        })

        doc += `🏷️ *Bot Oficial:* ${botName}\n`
        doc += `💡 _Para nomear uma patente (Dono):_ \`.setdono <cargo> @usuario\``

        return reply(doc.trim(), mentions)
    }
}