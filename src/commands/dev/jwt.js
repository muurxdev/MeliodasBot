/**
 * Comando .jwt
 * Decodificador e inspetor de cabeçalho e payload de JSON Web Tokens (JWT)
 */

const { decodeJWT } = require('../../services/devService')

module.exports = {
    name: 'jwt',
    aliases: ['jwtdecode', 'token'],
    category: 'dev',
    description: 'Decodifica e inspeciona o Header e Payload de um JSON Web Token (JWT)',
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Informe o token JWT para inspeção.\n\n📌 *Exemplo:* `.jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`')
        }

        try {
            const decoded = decodeJWT(text.trim())
            const headerStr = JSON.stringify(decoded.header, null, 2)
            const payloadStr = JSON.stringify(decoded.payload, null, 2)

            let expInfo = ''
            if (decoded.payload.exp) {
                const expDate = new Date(decoded.payload.exp * 1000)
                const isExpired = Date.now() > decoded.payload.exp * 1000
                expInfo = `\n⏰ *Expiração (exp):* ${expDate.toISOString()} ${isExpired ? '⚠️ *(EXPIRADO)*' : '✅ *(VÁLIDO)*'}`
            }

            const res = `🎫 *INSPEÇÃO DE JWT*

📦 *HEADER:*
\`\`\`json
${headerStr}
\`\`\`

📋 *PAYLOAD:*
\`\`\`json
${payloadStr}
\`\`\`
${expInfo}`

            await reply(res.trim())
        } catch (err) {
            await reply(`❌ *Erro:* ${err.message}`)
        }
    }
}

