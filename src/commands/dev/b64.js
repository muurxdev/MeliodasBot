/**
 * Comando .b64
 * Codificador e decodificador Base64
 */

const { encodeBase64, decodeBase64 } = require('../../services/devService')

module.exports = {
    name: 'b64',
    aliases: ['base64', 'b64encode', 'b64decode'],
    category: 'dev',
    description: 'Codifica ou decodifica strings de texto em formato Base64',
    execute: async ({ args, text, reply }) => {
        const sub = args[0]?.toLowerCase()

        if (!text || (!['encode', 'decode', 'codificar', 'decodificar'].includes(sub) && args.length < 1)) {
            return reply('❌ Informe a operação e o texto.\n\n📌 *Exemplos:*\n• `.b64 encode Olá Mundo`\n• `.b64 decode T2zDoSBNdW5kbw==`')
        }

        const isDecode = sub === 'decode' || sub === 'decodificar'
        const content = ['encode', 'decode', 'codificar', 'decodificar'].includes(sub)
            ? args.slice(1).join(' ')
            : text

        if (!content) {
            return reply('❌ Digite o texto a ser processado.')
        }

        try {
            if (isDecode) {
                const decoded = decodeBase64(content)
                await reply(`🔓 *BASE64 DECODIFICADO:*\n\`\`\`\n${decoded}\n\`\`\``)
            } else {
                const encoded = encodeBase64(content)
                await reply(`🔒 *BASE64 CODIFICADO:*\n\`\`\`\n${encoded}\n\`\`\``)
            }
        } catch (err) {
            await reply(`❌ *Erro:* ${err.message}`)
        }
    }
}

