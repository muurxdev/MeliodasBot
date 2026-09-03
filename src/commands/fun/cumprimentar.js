const logger = require('../../core/logger')

function getPeriodo() {
    const h = new Date().getHours()
    if (h >= 5 && h < 12) return { periodo: 'Bom dia', emoji: '☀️' }
    if (h >= 12 && h < 18) return { periodo: 'Boa tarde', emoji: '🌤️' }
    return { periodo: 'Boa noite', emoji: '🌙' }
}

module.exports = {
    name: 'cumprimentar',
    aliases: ['oi', 'olá', 'hello'],
    category: 'fun',
    subcategory: 'Interação',
    description: 'Cumprimente alguém com bom dia/boa tarde/boa noite',
    cooldownMs: 3000,
    execute: async ({ sender, reply, mentionedJid }) => {
        const { periodo, emoji } = getPeriodo()

        if (!mentionedJid || mentionedJid === sender) {
            return reply(
                `${emoji} *${periodo},* @${sender.split('@')[0]}! Como vai você? 😊`
            )
        }

        const mentions = [sender, mentionedJid]
        return reply(
            `${emoji} *${periodo},* @${mentionedJid.split('@')[0]}!\n\n` +
            `Enviado com carinho por @${sender.split('@')[0]} 💕`,
            mentions
        )
    }
}
