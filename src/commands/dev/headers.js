/**
 * Comando .headers
 * Inspeciona cabeçalhos HTTP de uma URL com proteção SSRF
 */

const { inspectHttpHeaders } = require('../../services/devService')

module.exports = {
    name: 'headers',
    aliases: ['httpheaders', 'curl-head'],
    category: 'dev',
    description: 'Inspeciona cabeçalhos de resposta HTTP de uma URL pública',
    cooldownMs: 3000,
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Informe a URL para inspecionar os cabeçalhos HTTP.\n\n📌 *Exemplo:* `.headers https://api.github.com`')
        }

        try {
            const res = await inspectHttpHeaders(text.trim())

            let msg = `🌐 *CABEÇALHOS HTTP*\n`
            msg += `📌 *Status:* \`${res.statusCode} ${res.statusMessage}\`\n\n`
            msg += `*Headers:*\n\`\`\`json\n${JSON.stringify(res.headers, null, 2).slice(0, 1000)}\n\`\`\``

            await reply(msg)
        } catch (err) {
            await reply(`❌ *Erro ao consultar cabeçalhos:* ${err.message}`)
        }
    }
}

