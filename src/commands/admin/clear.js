const logger = require('../../core/logger')

module.exports = {
    name: 'clear',
    aliases: ['apagar', 'delete', 'del'],
    category: 'admin',
    description: 'Apaga a mensagem citada',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, client }) => {
        const quotedKey = info.message?.extendedTextMessage?.contextInfo?.stanzaId
        const quotedParticipant = info.message?.extendedTextMessage?.contextInfo?.participant

        if (quotedKey) {
            await client.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: quotedKey,
                    participant: quotedParticipant
                }
            })
        } else {
            await client.sendMessage(from, { delete: info.key })
        }
    }
}