const env = require('../../config/env')

module.exports = {
    name: 'info',
    aliases: ['sobre', 'botinfo'],
    category: 'general',
    description: 'Informações sobre a arquitetura e tecnologias do bot',
    execute: async ({ reply }) => {
        const uptime = process.uptime()
        const horas = Math.floor(uptime / 3600)
        const minutos = Math.floor((uptime % 3600) / 60)
        const segundos = Math.floor(uptime % 60)

        const mem = process.memoryUsage()
        const ramMb = Math.round(mem.rss / 1024 / 1024)

        const uniqueIds = [...new Set(env.botOwnerIds)]
        const devPhone = env.formatPhoneFromJid(uniqueIds[0])
        const coDevPhone = env.formatPhoneFromJid(uniqueIds[1] || '')

        const { getBotName } = require('../../config/botConfig')
        const botName = getBotName()
        const info = '🤖 *' + botName + ' — INFORMAÇÕES*\n\n⚡ *Versão:* 2.0.0 (Modular Engine + SQLite)\n🧠 *Linguagem:* Node.js (' + process.version + ')\n🌐 *Bot:* ' + botName + '\n⏱️ *Uptime:* ' + horas + 'h ' + minutos + 'm ' + segundos + 's\n💾 *Memória RAM:* ' + ramMb + ' MB\n🎖️ *Dono:* ' + botName
        await reply(info)
    }
}